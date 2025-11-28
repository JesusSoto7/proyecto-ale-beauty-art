class SupportMessage < ApplicationRecord
    belongs_to :order

    validates :message_text, presence: true, length: { minimum: 10 }
    validates :replied, inclusion: { in: [true, false] }

    before_validation :filtrar_malas_palabras_en_mensaje

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

    validates :ip_address, format: {
        with: /\A(?:\d{1,3}\.){3}\d{1,3}\z/,
        message: "formato inválido"
    }, allow_blank: true

    private

    def filtrar_malas_palabras_en_mensaje
      return if message_text.blank?

      BAD_WORDS.each do |palabra|
        regex = /\b#{Regexp.escape(palabra)}\b/i
        message_text.gsub!(regex, censurar(palabra))
      end
    end

    def censurar(palabra)
      palabra[0] + "*" * (palabra.length - 1)
    end

end
