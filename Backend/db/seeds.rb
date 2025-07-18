# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

Role.find_or_create_by(name: 'admin')
Role.find_or_create_by(name: 'cliente')

atlantico = Department.create!(nombre: "Atlántico")

barranquilla = Municipality.create!(nombre: "Barranquilla", department: atlantico)
soledad = Municipality.create!(nombre: "Soledad", department: atlantico)

Neighborhood.create!(nombre: "El Prado", municipality: barranquilla)
Neighborhood.create!(nombre: "Boston", municipality: barranquilla)
Neighborhood.create!(nombre: "La Concepción", municipality: barranquilla)
Neighborhood.create!(nombre: "Rebolo", municipality: barranquilla)
Neighborhood.create!(nombre: "Villa Santos", municipality: barranquilla)

Neighborhood.create!(nombre: "Hipódromo", municipality: soledad)
Neighborhood.create!(nombre: "Ciudadela Metropolitana", municipality: soledad)
Neighborhood.create!(nombre: "Villa Katanga", municipality: soledad)
Neighborhood.create!(nombre: "Los Almendros", municipality: soledad)
Neighborhood.create!(nombre: "Centro", municipality: soledad)
