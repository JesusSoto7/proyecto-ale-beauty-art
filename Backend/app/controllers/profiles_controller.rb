class ProfilesController < ApplicationController
  before_action :authenticate_user!
  layout "inicio"
  
  def show
    @user = current_user
  end
   def edit
    @user = current_user
  end

 def update
  @user = current_user
  
  if @user.update(user_params)
    redirect_to profile_path, notice: "¡Perfil actualizado!"
  else
    puts "ERRORES: #{@user.errors.full_messages}" # Debug en consola
    flash.now[:alert] = "Error: #{@user.errors.full_messages.to_sentence}"
    render :edit, status: :unprocessable_entity
  end
end

private

def user_params
  params.require(:user).permit(:nombre, :apellido, :telefono, :direccion, :email)
end
  
end
