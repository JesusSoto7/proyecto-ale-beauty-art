class ProfilesController < ApplicationController
    before_action :authenticate_user!
  
  def show
    @user = current_user
  end
   def edit
    @user = current_user
  end

  def update
    @user = current_user
    if @user.update(user_params)
      redirect_to user_profile_path, notice: 'Perfil actualizado correctamente.'
    else
      render :edit
    end
  end

  private

  def user_params
    params.require(:user).permit(:nombre, :apellido, :telefono, :direccion, :email)
  end

end
