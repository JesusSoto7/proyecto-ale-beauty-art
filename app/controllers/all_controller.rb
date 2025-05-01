class AllController < ApplicationController
    def index
        @products = Product.all
    end
end
