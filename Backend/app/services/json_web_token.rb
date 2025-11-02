class JsonWebToken
  SECRET_KEY = Rails.application.secret_key_base

  def self.encode(payload, exp = 24.hours.from_now)
    data = payload.dup
    data[:exp] = exp.to_i
    JWT.encode(data, SECRET_KEY, 'HS256')
  end

  def self.decode(token)
    decoded = JWT.decode(
      token,
      SECRET_KEY,
      true,                        # verify signature
      { algorithm: 'HS256', verify_expiration: true }
    )[0]
    HashWithIndifferentAccess.new(decoded)
  end
end