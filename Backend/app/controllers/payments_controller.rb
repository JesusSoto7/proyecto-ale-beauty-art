class PaymentsController < ApplicationController
  layout 'checkout'
  skip_before_action :verify_authenticity_token, only: [:create]

  def new
  end

  def create
    require 'mercadopago'
    sdk = Mercadopago::SDK.new(ENV['MERCADOPAGO_ACCESS_TOKEN'])

    payment_data = {
      transaction_amount: params[:transactionAmount].to_f,
      token: params[:token],
      description: params[:description],
      installments: params[:installments].to_i,
      payment_method_id: params[:paymentMethodId],
      payer: {
        email: params[:cardholderEmail],
        identification: {
          type: params[:identificationType],
          number: params[:identificationNumber]
        },
        first_name: params[:cardholderName]
      }
    }

    payment_response = sdk.payment.create(payment_data)
    payment = payment_response[:response]



  end


end
