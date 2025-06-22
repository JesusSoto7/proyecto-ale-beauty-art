class PagesAboutController < ApplicationController
    skip_before_action :authenticate_user!
   layout "inicio"
   def about 
    
   end
end
