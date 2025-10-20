class Api::V1::AiController < Api::V1::BaseController
  def ask
    user_prompt = params[:prompt].to_s

    keywords = %w[gloss lipgloss lipstick labial brillo pintalabios delineador blush rubor base sombra mascara rimel polvo ceja brow corrector iluminador serum toner crema bloqueador hidratante exfoliante]
    value_keywords = %w[calidad-precio barato económico oferta promoción destacado popular accesible asequible recomendado value]
    discount_keywords = %w[descuento descuentos oferta ofertas promoción promociones rebaja rebajas sale cuando cuándo comenzó inicio empezó termina finaliza vigencia válido]
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

    keyword = keywords.find { |k| prompt_down.include?(k) }
    value_prompt = value_keywords.any? { |k| prompt_down.include?(k) }
    discount_prompt = discount_keywords.any? { |k| prompt_down.include?(k) }
    routine_prompt = routine_keywords.any? { |k| prompt_down.match?(/\b#{Regexp.escape(k)}\b/) }

    query = Product.includes(sub_category: :category, discount: [])

    if discount_prompt
      todos_los_productos = Product.includes(sub_category: :category, discount: []).distinct.to_a
      
      productos_con_descuento = todos_los_productos.select do |p|
        descuento = p.mejor_descuento_para_precio
        descuento.present? && p.precio_con_mejor_descuento < p.precio_producto
      end.sort_by(&:precio_producto).take(5)
      
      Rails.logger.info("🔍 Total productos con descuento encontrados: #{productos_con_descuento.count}")
      
      if productos_con_descuento.empty?
        render json: { response: "Actualmente no hay productos con descuento activo. Te recomiendo revisar más tarde o explorar nuestros productos de calidad-precio." }
        return
      end
      
      productos_relacionados = productos_con_descuento
    elsif value_prompt
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

    if user_prompt =~ /menos de (\d+)/
      max_price = user_prompt[/menos de (\d+)/, 1].to_f
      query = query.where('precio_producto < ?', max_price)
    elsif user_prompt =~ /entre (\d+) y (\d+)/
      min_price = user_prompt[/entre (\d+) y (\d+)/, 1].to_f
      max_price = user_prompt[/entre (\d+) y (\d+)/, 2].to_f
      query = query.where('precio_producto BETWEEN ? AND ?', min_price, max_price)
    end

    productos_relacionados ||= query.distinct.limit(routine_prompt ? 10 : 5)

    if productos_relacionados.empty?
      productos_relacionados = Product.order(precio_producto: :asc).limit(routine_prompt ? 10 : 5)
    end

  productos_info = if productos_relacionados.any?
    productos_relacionados.map do |p|
      categoria = p.sub_category&.category&.nombre_categoria || ""
      subcategoria = p.sub_category&.nombre || ""
      precio_original = p.precio_producto
      precio_descuento = p.precio_con_mejor_descuento
      descuento_info = p.mejor_descuento_para_precio

      precio_original_formateado = ActionController::Base.helpers.number_to_currency(precio_original, unit: "$", separator: ",", delimiter: ".", precision: 0)
      
      if descuento_info && precio_descuento < precio_original
        precio_descuento_formateado = ActionController::Base.helpers.number_to_currency(precio_descuento, unit: "$", separator: ",", delimiter: ".", precision: 0)
        porcentaje = descuento_info.tipo == "porcentaje" ? "#{descuento_info.valor}%" : ActionController::Base.helpers.number_to_currency(descuento_info.valor, unit: "$", separator: ",", delimiter: ".", precision: 0)
        
        fecha_inicio = descuento_info.fecha_inicio.strftime("%d/%m/%Y") rescue "N/A"
        fecha_fin = descuento_info.fecha_fin ? descuento_info.fecha_fin.strftime("%d/%m/%Y") : "Sin fecha de fin"
        
        descuento_texto = "**Precio con descuento: #{precio_descuento_formateado} COP** (antes: #{precio_original_formateado} COP) - **Descuento: #{descuento_info.nombre} (#{porcentaje})** - Válido desde #{fecha_inicio} hasta #{fecha_fin}"
      else
        descuento_texto = "Precio: #{precio_original_formateado} COP"
      end

      "- **#{p.nombre_producto}** (#{categoria} / #{subcategoria}): #{p.descripcion&.truncate(60)}, #{descuento_texto}"
    end.join("\n")
  else
    nil
  end

    if productos_info.nil? || productos_info.strip == ""
      render json: { response: "Solo puedo recomendar productos disponibles en la tienda." }
      return
    end

    first_message = params[:first_message] == true || params[:first_message] == "true"

    base_intro = if first_message
      "Te llamas Amélie, eres la asistente virtual de Ale Beauty Art. Preséntate como Amélie solo en este mensaje."
    else
      "Responde como Amélie, la experta en belleza de Ale Beauty Art, pero NO te presentes ni digas tu nombre, solo responde profesionalmente."
    end

    prompt = if discount_prompt
      <<~PROMPT
        #{base_intro}
        El usuario pregunta por productos con descuento activo. TODOS los productos de la lista tienen descuento activo ahora mismo.

        Si te preguntan "¿hasta cuándo?" o por las fechas del descuento, menciona la fecha de fin del descuento de los productos.
        Menciona brevemente que sí hay descuentos y recomienda 2-3 productos destacados con su descuento y fechas. Responde en máximo 3 frases breves.
        Responde usando formato Markdown limpio (usa negritas para nombres de productos, precios y fechas).

        Productos con descuento:
        #{productos_info}

        Pregunta del usuario: #{user_prompt}
      PROMPT
    elsif routine_prompt
      <<~PROMPT
        #{base_intro}
        El usuario pide una rutina de maquillaje utilizando solo productos de la siguiente lista y debe indicar el precio de cada producto (si tiene descuento, usa el precio con descuento).
        Responde exclusivamente con el paso a paso de la rutina, nombra los productos concretos de la lista, indica el precio de cada uno (con descuento si aplica) y el total aproximado en COP.
        Responde usando formato Markdown limpio (usa títulos, listas numeradas, negritas para los nombres de productos y precios).

        Productos disponibles:
        #{productos_info}

        Pregunta del usuario: #{user_prompt}
      PROMPT
    elsif value_prompt
      <<~PROMPT
        #{base_intro}
        El usuario busca productos de buena relación calidad-precio o con descuento. Solo puedes recomendar productos de la siguiente lista.

        Elige el producto que consideres mejor calidad-precio (prioriza los que tienen descuento activo) y explícales por qué, pero responde en máximo 2 frases de no más de 30 palabras en total. Sé directo y muy breve. Menciona si hay descuento activo.
        Responde usando formato Markdown limpio (usa negritas para nombres de productos y precios).

        Productos disponibles:
        #{productos_info}

        Pregunta del usuario: #{user_prompt}
      PROMPT
    else
      <<~PROMPT
        #{base_intro}
        Solo puedes recomendar productos de la siguiente lista (si tienen descuento, menciona el precio con descuento y el descuento aplicado):

        Productos disponibles:
        #{productos_info}

        Si el usuario te pregunta si eres Amélie, si eres asistente, quién eres, o tu rol, responde brevemente: "Sí, soy Amélie, la asistente virtual de Ale Beauty Art."
        Si el usuario te pregunta por la tienda, ubicación, horarios, envíos, pagos, devoluciones, políticas, o cualquier tema NO relacionado con los productos, responde brevemente: "Para consultas sobre la tienda, envíos o políticas, por favor contacta a nuestro soporte."
        Si el usuario te pregunta que significa Ale Beauty Art, responde brevemente: "Ale Beauty Art es una tienda especializada en productos de belleza y maquillaje."
        Si el usuario te pregunta por tu opinión personal, gustos, preferencias, sentimientos, emociones, vida personal, o cualquier tema NO relacionado con los productos o tu identidad como Amélie, responde brevemente: "No tengo opiniones personales, pero puedo ayudarte con información sobre nuestros productos."
        Si el usuario te pregunta que significa tu nombre, responde brevemente: "Amélie significa trabajadora y diligente, reflejando a una persona constante, valiente y llena de energía. También se asocia con la dulzura y la ternura, cualidades que hacen de Amélie alguien amable, sensible y con una calidez natural que ilumina a quienes la rodean."
        Si la pregunta no tiene relación con estos productos ni tu identidad, responde: "Solo puedo recomendar productos disponibles en la tienda."
        Responde SIEMPRE en máximo 2 frases de no más de 30 palabras en total. Sé directo y muy breve.
        Responde usando formato Markdown limpio (usa negritas para nombres de productos y precios).

        Pregunta del usuario: #{user_prompt}
      PROMPT
    end

    result = GeminiService.ask(prompt)
    Rails.logger.info("Gemini response: #{result.inspect}")

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