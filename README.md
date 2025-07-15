# Payment Strategy Calculator

A full-stack financial calculator web application that helps users compare payment strategies between lump sum and installment payments, considering opportunity costs, fees, and investment returns.

Available in multiple implementations:
- **Static HTML/CSS/JS** - GitHub Pages deployable version
- **Python Flask** - Server-side rendered with Python backend

## 🚀 Features

- **Smart Recommendations**: Algorithmic analysis to determine optimal payment strategy
- **Real-time Calculations**: Updates as you type with instant feedback
- **Investment Analysis**: Monthly compound interest calculations for remaining balances
- **Payment Scheduling**: Visual timeline of installment payments
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, professional interface

## 🛠 Tech Stack Options

### Option 1: Static Website (Original)
- **Frontend**: Pure HTML, CSS, and JavaScript
- **Deployment**: GitHub Pages, Netlify, Vercel
- **Features**: No server required, instant loading

### Option 2: Python Flask (New)
- **Frontend**: Jinja2 templates with modern CSS and JavaScript
- **Backend**: Flask with Python 3.12+
- **Features**: Server-side rendering, REST API, error handling

## 📋 Prerequisites

### For Python Flask Version
- Python 3.12+
- pip or poetry
- No database required (calculations are stateless)

## 🔧 Installation

### Python Flask Version

1. **Clone the repository**
   ```bash
   git clone https://github.com/nsanka/tuition-strategy.git
   cd tuition-strategy
   ```

2. **Install Python dependencies**
   ```bash
   # Using pip
   pip install flask gunicorn python-dateutil

   # Or using poetry (recommended)
   poetry install
   # Activate the virtual environment
   eval $(poetry env activate)
   ```

3. **Set up environment variables (optional)**
   ```bash
   export FLASK_ENV=development
   export PORT=5000
   ```

4. **Run the Flask application**
   ```bash
   # Development
   python app.py

   # Using poetry
   poetry run start

   # Production with Gunicorn
   gunicorn app:app
   ```

   The application will be available at `http://localhost:5500`

## 📜 Available Scripts

### Python Flask Version
- `python app.py` - Start development server
- `gunicorn app:app` - Run production server
- `flask --app app run --debug` - Run with Flask CLI in debug mode
- `poetry run start` - Run with Poetry

## 🌐 Deployment

### Heroku Deployment

#### For Python Flask Version

1. **Create Heroku app**
   ```bash
   heroku create payment-calculator-python
   ```

2. **Set Python buildpack**
   ```bash
   heroku buildpacks:set heroku/python
   ```

3. **Create required files** (already included):
   - `Procfile`: `web: gunicorn app:app`
   - `runtime.txt`: `python-3.12.7`
   - Python dependencies in `pyproject.toml`

4. **Deploy to Heroku**
   ```bash
   git add .
   git commit -m "Deploy Flask app to Heroku"
   git push heroku main
   ```

5. **Open your app**
   ```bash
   heroku open
   ```

### Docker Deployment

#### For Python Flask Version
1. **Create Dockerfile**
   ```dockerfile
   FROM python:3.12-slim

   WORKDIR /app
   COPY pyproject.toml poetry.lock ./
   RUN pip install uv && uv sync --frozen

   COPY . .

   EXPOSE 5000
   CMD ["gunicorn", "--bind", "0.0.0.0:5500", "app:app"]
   ```

2. **Build and run either version**
   ```bash
   docker build -t tuition-strategy .
   docker run -p 5500:5500 tuition-strategy
   ```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5500) | No |
| `SESSION_SECRET` | Session encryption key | Production only |

## 📁 Project Structure

### Python Flask Version
```
├── tuition_strategy           # Tuition Strategy Module
│   └── app.py                 # Flask application and API routes
│   └── templates/             # Jinja2 HTML templates
│   │   └── calculator.html    # Main calculator page
│   └── static/                # Static assets
│   │   ├── css/
│   │   │   └── styles.css     # Application styling
│   │   └── js/
│   │       └── calculator.js  # Frontend JavaScript
├── Procfile                   # Heroku deployment configuration
├── runtime.txt                # Python version specification
└── pyproject.toml             # Python dependencies
└── __init__.py                # Python version specification
```

### Static Website Version
```
├── docs/                 # GitHub Pages deployable version
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Styling
│   ├── calculator.js      # JavaScript functionality
│   └── README.md          # Deployment instructions
```

## 📄 License

GNU GENERAL PUBLIC LICENSE - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📞 Support

- Create an [issue](https://github.com/nsanka/tuition-strategy/issues) for bug reports
- Check [discussions](https://github.com/nsanka/tuition-strategy/discussions) for questions
- Review [documentation](https://github.com/nsanka/tuition-strategy/wiki) for guides

---

Built with ❤️ for smarter financial decisions.