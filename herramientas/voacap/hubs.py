H=[("Alicante",38.37,-0.50),("Madrid",40.42,-3.70),("Barcelona",41.39,2.17),("Sevilla",37.39,-5.98),("Galicia",42.88,-8.54),("Bilbao",43.26,-2.93),("Zaragoza",41.65,-0.89),("Baleares",39.57,2.65),("Canarias",28.29,-16.0),("Badajoz",38.88,-6.97),
("Lisboa",38.72,-9.14),("Oporto",41.15,-8.61),("Burdeos",44.84,-0.58),("París",48.86,2.35),("Lyon",45.76,4.84),("Marsella",43.30,5.37),("Londres",51.51,-0.13),("Glasgow",55.86,-4.25),("Dublín",53.35,-6.26),("Bruselas",50.85,4.35),
("Ámsterdam",52.37,4.90),("Fráncfort",50.11,8.68),("Berlín",52.52,13.40),("Múnich",48.14,11.58),("Viena",48.21,16.37),("Milán",45.46,9.19),("Roma",41.90,12.50),("Palermo",38.12,13.36),
("Atenas",37.98,23.73),("Belgrado",44.79,20.45),("Budapest",47.50,19.04),("Praga",50.08,14.44),("Varsovia",52.23,21.01),("Helsinki",60.17,24.94),("Estocolmo",59.33,18.07),("Oslo",59.91,10.75),("Copenhague",55.68,12.57),
("Bucarest",44.43,26.10),("Kiev",50.45,30.52),("Moscú",55.76,37.62),("San Petersburgo",59.93,30.34),("Estambul",41.01,28.98),("Ankara",39.93,32.86),("Reikiavik",64.15,-21.94),("Chipre",35.17,33.36),
("Boston",42.36,-71.06),("Nueva York",40.71,-74.01),("Washington",38.91,-77.04),("Atlanta",33.75,-84.39),("Miami",25.76,-80.19),("Chicago",41.88,-87.63),("Toronto",43.65,-79.38),("Montreal",45.50,-73.57),("Halifax",44.65,-63.57),("Dallas",32.78,-96.80),
("Houston",29.76,-95.37),("Denver",39.74,-104.99),("Minneapolis",44.98,-93.27),("Phoenix",33.45,-112.07),("Los Ángeles",34.05,-118.24),("San Francisco",37.77,-122.42),("Seattle",47.61,-122.33),("Calgary",51.05,-114.07),("Anchorage",61.22,-149.90),
("Honolulu",21.31,-157.86),("México",19.43,-99.13),("Guatemala",14.63,-90.51),("Panamá",8.98,-79.52),("Puerto Rico",18.47,-66.11),("La Habana",23.11,-82.37),("Santo Domingo",18.49,-69.93),
("Caracas",10.49,-66.88),("Bogotá",4.71,-74.07),("Quito",-0.18,-78.47),("Lima",-12.05,-77.04),("La Paz",-16.50,-68.15),("Santiago",-33.45,-70.67),("Buenos Aires",-34.60,-58.38),("Asunción",-25.26,-57.58),("São Paulo",-23.55,-46.63),("Brasilia",-15.79,-47.88),
("Recife",-8.05,-34.88),("Manaos",-3.12,-60.02),("Patagonia",-45.86,-67.48),
("Casablanca",33.57,-7.59),("Argel",36.75,3.06),("Túnez",36.81,10.18),("El Cairo",30.04,31.24),("Dakar",14.72,-17.47),("Lagos",6.52,3.38),("Nairobi",-1.29,36.82),("Adís Abeba",9.03,38.74),("Kinsasa",-4.44,15.27),("Johannesburgo",-26.20,28.05),
("Ciudad del Cabo",-33.92,18.42),("Reunión",-21.11,55.53),
("Tel Aviv",32.09,34.78),("Riad",24.71,46.68),("Dubái",25.20,55.27),("Teherán",35.69,51.39),("Taskent",41.30,69.24),("Karachi",24.86,67.00),("Delhi",28.61,77.21),("Bombay",19.08,72.88),("Bangalore",12.97,77.59),("Calcuta",22.57,88.36),
("Bangkok",13.76,100.50),("Singapur",1.35,103.82),("Yakarta",-6.21,106.85),("Manila",14.60,120.98),("Hong Kong",22.32,114.17),("Shanghái",31.23,121.47),("Pekín",39.90,116.41),("Chengdu",30.57,104.07),("Seúl",37.57,126.98),("Tokio",35.68,139.69),
("Sapporo",43.06,141.35),("Taipéi",25.03,121.57),("Novosibirsk",55.01,82.93),("Ekaterimburgo",56.84,60.60),("Almaty",43.24,76.89),("Vladivostok",43.12,131.89),("Irkutsk",52.29,104.28),
("Perth",-31.95,115.86),("Adelaida",-34.93,138.60),("Melbourne",-37.81,144.96),("Sídney",-33.87,151.21),("Brisbane",-27.47,153.03),("Darwin",-12.46,130.84),("Auckland",-36.85,174.76),("Christchurch",-43.53,172.64),("Fiyi",-18.14,178.44),]
def loc4(lat,lon):
    lon+=180;lat+=90
    return chr(65+int(lon//20))+chr(65+int(lat//10))+str(int((lon%20)//2))+str(int(lat%10))
if __name__=="__main__":
    ids=[loc4(a,b) for _,a,b in H];import collections
    print(len(H),[k for k,v in collections.Counter(ids).items() if v>1])
