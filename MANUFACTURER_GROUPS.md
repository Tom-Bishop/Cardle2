# Cardle Manufacturer Groups

This document shows all parent companies and their subsidiary brands used in the game for partial match detection.

## Complete Manufacturer Breakdown

| Parent Company | Brands |
|---|---|
| **Stellantis** | Jeep, Dodge, Ram, Fiat, Alfa Romeo, Ferrari, Lamborghini, Maserati, Peugeot, Citroen, DS Automobiles, Opel, Vauxhall |
| **Volkswagen Group** | Volkswagen, Audi, Porsche, Skoda, SEAT, Cupra |
| **Toyota Group** | Toyota, Lexus |
| **Honda Group** | Honda, Acura |
| **Nissan Group** | Nissan, Infiniti |
| **Hyundai Group** | Hyundai, Genesis, Kia |
| **BMW Group** | BMW, MINI |
| **Ford Motor** | Ford, Lincoln |
| **General Motors** | Cadillac, Chevrolet, GMC |
| **Renault Group** | Renault, Dacia |
| **Volvo/Geely** | Volvo, Polestar |
| **Tata Motors** | Jaguar, Land Rover |
| **Renault-Nissan-Mitsubishi Alliance** | Mitsubishi |
| **Standalone** | Mercedes-Benz, Tesla, Mazda, Subaru, Suzuki, Isuzu, SsangYong, BYD, ORA, MG |

## Summary Statistics

- **Total Unique Parent Groups**: 14
- **Total Car Makes**: 40
- **Largest Group**: Stellantis (13 brands)
- **Groups with 2+ Brands**: 12
- **Standalone Brands**: 8

## Game Mechanics

When a player guesses a car make, if it matches a different brand in the **same parent company**, they receive a **partial match (amber)** with the parent company name displayed as a hint.

For example:
- Guessing "Audi" when the answer is "Volkswagen" → **Partial Match** (both VW Group)
- Guessing "Lexus" when the answer is "Toyota" → **Partial Match** (both Toyota Group)
- Guessing "Ford" when the answer is "Lincoln" → **Partial Match** (both Ford)
