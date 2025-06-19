import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import ServiceOne from './components/ServiceOne';
import ServiceTwo from './components/ServiceTwo';
import RedisDemo from './components/RedisDemo';
import KafkaDemo from './components/KafkaDemo';

function App() {
  return (
      <Router>
        <div className="App">
          <header className="App-header">
            <nav className="navbar">
              <div className="nav-brand">
                <h1>🏗️ Микросервисная Песочница</h1>
              </div>
              <ul className="nav-links">
                <li><Link to="/">Дашборд</Link></li>
                <li><Link to="/service-one">Service One</Link></li>
                <li><Link to="/service-two">Service Two</Link></li>
                <li><Link to="/redis">Redis</Link></li>
                <li><Link to="/kafka">Kafka</Link></li>
              </ul>
            </nav>
          </header>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/service-one" element={<ServiceOne />} />
              <Route path="/service-two" element={<ServiceTwo />} />
              <Route path="/redis" element={<RedisDemo />} />
              <Route path="/kafka" element={<KafkaDemo />} />
            </Routes>
          </main>

          <footer className="footer">
            <p>© 2024 Микросервисная Экосистема. Все права защищены.</p>
            <div className="footer-links">
              <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">
                📊 Grafana
              </a>
              <a href="http://localhost:9090" target="_blank" rel="noopener noreferrer">
                📈 Prometheus
              </a>
              <a href="http://localhost:8090" target="_blank" rel="noopener noreferrer">
                🔄 Kafka UI
              </a>
            </div>
          </footer>
        </div>
      </Router>
  );
}

export default App;