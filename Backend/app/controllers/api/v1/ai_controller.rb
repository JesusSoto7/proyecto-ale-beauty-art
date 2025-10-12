class Api::V1::AiController < Api::V1::BaseController
  def ask
    user_prompt = params[:prompt].to_s

    # Palabras clave comunes y de intención
    keywords = %w[gloss lipgloss lipstick labial brillo pintalabios delineador blush rubor base sombra mascara rimel polvo ceja brow corrector iluminador serum toner crema bloqueador hidratante exfoliante]
    value_keywords = %w[calidad-precio barato económico oferta promoción destacado popular accesible asequible recomendado value]
    # Usa SOLO palabras/frases claras de rutina
    routine_keywords = [
      'rutina de maquillaje',
      'rutina facial',
      'rutina diaria',
      'rutina sencilla',
      'rutina rápida',
      'maquillaje completo',
      'maquillaje básico',
      'maquillaje natural',
      'rutina'
    ]

    prompt_down = user_prompt.downcase

    # Detectar intención
    keyword = keywords.find { |k| prompt_down.include?(k) }
    value_prompt = value_keywords.any? { |k| prompt_down.include?(k) }
    # Solo activa rutina si la frase/delimitador completo está presente
    routine_prompt = routine_keywords.any? { |k| prompt_down.match?(/\b#{Regexp.escape(k)}\b/) }

    query = Product.includes(sub_category: :category)

    if value_prompt
      query = query.order(precio_producto: :asc)
    elsif keyword
      query = query.where('nombre_producto LIKE ? OR descripcion LIKE ?', "%#{keyword}%", "%#{keyword}%")
    elsif defined?(SubCategory) && SubCategory.table_exists?
      subcats = SubCategory.pluck(:nombre)
      subcat_match = subcats.find { |sc| prompt_down.include?(sc.downcase) }
      if subcat_match
        query = query.joins(:sub_category).where('sub_categories.nombre LIKE ?', "%#{subcat_match}%")
      end
    elsif defined?(Category) && Category.table_exists?
      cats = Category.pluck(:nombre_categoria)
      cat_match = cats.find { |cat| prompt_down.include?(cat.downcase) }
      if cat_match
        query = query.joins(sub_category: :category).where('categories.nombre_categoria LIKE ?', "%#{cat_match}%")
      end
    else
      query = query.where('nombre_producto LIKE ? OR descripcion LIKE ?', "%#{user_prompt}%", "%#{user_prompt}%")
    end

    # Rango de precio explícito, si el usuario lo pide
    if user_prompt =~ /menos de (\d+)/
      max_price = user_prompt[/menos de (\d+)/, 1].to_f
      query = query.where('precio_producto < ?', max_price)
    elsif user_prompt =~ /entre (\d+) y (\d+)/
      min_price = user_prompt[/entre (\d+) y (\d+)/, 1].to_f
      max_price = user_prompt[/entre (\d+) y (\d+)/, 2].to_f
      query = query.where('precio_producto BETWEEN ? AND ?', min_price, max_price)
    end

    productos_relacionados = query.distinct.limit(routine_prompt ? 10 : 5)

    # Si después de todo esto NO hay productos, manda los más económicos/recientes
    if productos_relacionados.empty?
      productos_relacionados = Product.order(precio_producto: :asc).limit(routine_prompt ? 10 : 5)
    end

    productos_info = if productos_relacionados.any?
      productos_relacionados.map do |p|
        categoria = p.sub_category&.category&.nombre_categoria || ""
        subcategoria = p.sub_category&.nombre || ""
        precio_formateado = ActionController::Base.helpers.number_to_currency(p.precio_producto, unit: "$", separator: ",", delimiter: ".", precision: 0)
        "- #{p.nombre_producto} (#{categoria} / #{subcategoria}): #{p.descripcion&.truncate(60)}, Precio: #{precio_formateado} COP"
      end.join("\n")
    else
      nil # Indicador de que no hay productos
    end

    if productos_info.nil? || productos_info.strip == ""
      render json: { response: "Solo puedo recomendar productos disponibles en la tienda." }
      return
    end

    # Prompt para Gemini ajustado para rutina, calidad-precio, y general
    prompt = if routine_prompt
      <<~PROMPT
        Eres un experto en belleza para una tienda online. El usuario pide una rutina de maquillaje utilizando solo productos de la siguiente lista y debe indicar el precio de cada producto.
        Responde exclusivamente con el paso a paso de la rutina, nombra los productos concretos de la lista, indica el precio de cada uno y el total aproximado en COP.
        Responde usando formato Markdown limpio (usa títulos, listas numeradas, negritas para los nombres de productos y precios).

        Productos disponibles:
        #{productos_info}

        Pregunta del usuario: #{user_prompt}
      PROMPT
    elsif value_prompt
      <<~PROMPT
        Eres un experto en belleza para una tienda online. El usuario busca productos de buena relación calidad-precio. Solo puedes recomendar productos de la siguiente lista.

        Elige el producto que consideres mejor calidad-precio y explícales por qué, pero responde en máximo 2 frases de no más de 30 palabras en total. Sé directo y muy breve.
        Responde usando formato Markdown limpio (usa títulos, listas numeradas, negritas para los nombres de productos y precios).

        Productos disponibles:
        #{productos_info}

        Pregunta del usuario: #{user_prompt}
      PROMPT
    else
      <<~PROMPT
        Eres un experto en belleza para una tienda online. Solo puedes recomendar productos de la siguiente lista:

        Productos disponibles:
        #{productos_info}

        Si la pregunta no tiene relación con estos productos, responde: "Solo puedo recomendar productos disponibles en la tienda."
        Responde SIEMPRE en máximo 2 frases de no más de 30 palabras en total. Sé directo y muy breve.
        Responde usando formato Markdown limpio (usa títulos, listas numeradas, negritas para los nombres de productos y precios).

        Pregunta del usuario: #{user_prompt}
      PROMPT
    end

    result = GeminiService.ask(prompt)
    Rails.logger.info("Gemini response: #{result.inspect}")

    # Manejo de respuesta de Gemini
    if result.is_a?(Array)
      respuesta = result.map do |item|
        if item['candidates'] && item['candidates'][0] && item['candidates'][0]['content'] && item['candidates'][0]['content']['parts']
          item['candidates'][0]['content']['parts'].map { |part| part['text'] }.join
        else
          ""
        end
      end.join
    elsif result['candidates'] && result['candidates'][0] && result['candidates'][0]['content'] && result['candidates'][0]['content']['parts']
      respuesta = result['candidates'][0]['content']['parts'][0]['text']
    elsif result && result['error']
      respuesta = "Error IA: #{result['error']['message'] || result['error'].inspect}"
    else
      respuesta = "Ocurrió un error inesperado con la IA."
    end

    render json: { response: respuesta }
  end
end