class Review < ApplicationRecord
  belongs_to :user
  belongs_to :product

  validates :rating, inclusion: { in: 1..5 }
  validates :comentario, length: { maximum: 500 }

  # 🔹 Filtro de malas palabras
  before_validation :filtrar_malas_palabras

  BAD_WORDS = [
    # Insultos comunes
    "tonto", "idiota", "imbecil", "estupido", "pendejo", "baboso",
    "mamón", "gilipollas", "cretino", "tarado", "subnormal", "mongol",
    "ignorante", "inutil", "payaso", "majadero", "cabeza de chorlito",


    # jerga colonial
    "jopo", "monda", "añañin", "chingar", "chucha", "culote", "imbéciles", "imbécil",

    # Muy ofensivas / sexuales
    "mierda", "puta", "perra", "cabron", "malparido", "chingada", "coño",
    "verga", "pito", "culo", "joder", "polla", "zorra", "guarra",
    "marica", "maricón", "culero", "chúpamela", "p*to", "put*s",
    "coger", "follar", "felación", "mamada", "paja", "semen", "vagina",
    "mierdoso", "putazo", "reputa", "maldito", "ch*nga", "penetracion",
    "porqueria", "desgraciado", "desgraciada", "pendejada", "porqueria",
    "zorra", "porno", "pornografía", "chupala", 

    # Discurso de odio o violencia
    "nazi", "nazis", "fascista", "racista", "terrorista", "pedofilo", "violador",
    "asesino", "asesina", "genocida", "homicida", "matón", "matona",
    "intolerante", "discriminador", "opresor", "opresora", "mueranse", "matate",

    # Variaciones y diminutivos
    "tontito", "imbecilucho", "pendejada", "mierdecilla", "putilla",
    "cabronazo", "estupidez", "estupidoz", "gilipollez", "zorrilla",

    # Palabras reservadas (usuarios falsos)
    "admin", "administrador", "moderador", "root", "sistema", "soporte",
    "webmaster", "oficial", "cuentaoficial"
  ].freeze

  private

  def filtrar_malas_palabras
    return if comentario.blank?

    BAD_WORDS.each do |palabra|
      regex = /\b#{Regexp.escape(palabra)}\b/i
      comentario.gsub!(regex, censurar(palabra))
    end
  end

  def censurar(palabra)
    palabra[0] + "*" * (palabra.length - 1)
  end
end
