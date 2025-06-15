require 'mercadopago'

MercadoPagoClient = Mercadopago::SDK.new(ENV['MERCADOPAGO_ACCESS_TOKEN'])
