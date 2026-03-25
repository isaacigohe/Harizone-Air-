
#  Harizone Air

A simple travel assistant website built with HTML, CSS and JavaScript.
Plan your trip, check live weather, estimate your budget and explore destinations — all in one place.

---

##  Pages

###  Home 
The landing page. Features a full-screen hero section with a background image, headline and two call-to-action buttons. Below that is a stats row showing 120+ destinations, 50K+ travelers and more. There are also three feature cards, a live weather widget that auto-loads Nairobi weather on page open, and a popular cities section showing Paris, Jaipur and Rio.

### Destinations 
A searchable grid of travel destinations grouped by continent — Asia, Africa and Europe. Each city card shows a photo, a short description, an estimated daily budget and a region tag. You can type in the search bar to filter cards in real-time without reloading the page.

###  Budget Planner  
An interactive trip cost calculator. Choose a destination, enter the number of days, number of travelers and your travel style (Budget, Standard or Luxury). Click calculate and JavaScript works out the full estimated cost — hotel, food, transport, activities and flights — and displays an itemised breakdown in USD. A cost comparison table is also shown at the bottom.

###  Weather  
A live weather checker powered by the OpenWeatherMap API. Type any city name and click Get Weather to see the current temperature, weather description, humidity, wind speed and feels-like temperature. There are also quick-click buttons for popular cities like Paris, London, Tokyo, Dubai and Nairobi.

###  About  
Explains the mission behind Harizone Air — making travel planning free and simple for everyone. Includes a stats banner, four core value cards (Accessibility, Accuracy, Sustainability and Innovation), three team member cards and a section of travel tips. A call-to-action banner sits at the bottom linking to Destinations and Budget pages.

### Contact  
A contact page with a form that has four fields: Name, Email, Subject and Message. JavaScript validates that all required fields are filled before showing a green success message. The page also includes office locations in New York, London and Nairobi, support hours and an FAQ section answering six common travel questions.

---

##  Built With

- HTML5
- CSS3
- JavaScript (ES6)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Google Fonts](https://fonts.google.com)

---

##  How to Run

**1. Clone the repository**

```bash
git clone https://github.com/isaacigoche/harizone-air.git
```

**2. Open the project folder**

```bash
cd harizone-air
```

**3. Open in your browser**

```bash
open index.html
```

Or just double-click `index.html` — no server needed.

---

##  Weather API Key

The weather page uses the free OpenWeatherMap API.
To use your own key:

1. Sign up free at [openweathermap.org](https://openweathermap.org/api)
2. Copy your API key
3. Open `js/main.js` and replace line 4:

```javascript
const WEATHER_API_KEY = "your_api_key_here";
```

---

##  Made By

**Isaac Igohe**

- GitHub: [@isaacigohe](https://github.com/isaacigohe)