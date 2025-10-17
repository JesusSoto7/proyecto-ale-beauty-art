class Api::V1::NotificationsController < Api::V1::BaseController

  def index
    @notifications = current_user.user_notifications.includes(:notification_message).order(created_at: :desc)
    render json: @notifications.as_json(include: { notification_message: { only: [:title, :message, :created_at] } })
  end

  def create
    # 1. Crea el mensaje (solo una vez)
    notif_message = NotificationMessage.create!(
      title: params[:title],
      message: params[:message]
    )

    if params[:user_id] == "all"
      # 2. Relaciona con cada usuario (ajusta según tu rol de cliente)
      User.with_role(:cliente).find_each do |user|
        UserNotification.create!(
          user: user,
          notification_message: notif_message
        )
      end
      render json: { message: "Notificación enviada a todos los usuarios." }, status: :created
    else
      user = User.find(params[:user_id])
      UserNotification.create!(
        user: user,
        notification_message: notif_message
      )
      render json: { message: "Notificación enviada." }, status: :created
    end
  end

  def update
    notif = current_user.user_notifications.find(params[:id])
    notif.update(read: true)
    render json: notif
  end
end