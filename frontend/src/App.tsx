import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Header } from './components/Header';
import { AccountPage } from './pages/AccountPage';
import { ContestPage } from './pages/ContestPage';
import { LoginPage } from './pages/LoginPage';
import { MainPage } from './pages/MainPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SignUpPage } from './pages/SignUpPage';
import './App.css';

export const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Header />
        <Switch>
          <Route exact key="/" path="/" component={MainPage} />
          <Route exact key="/login" path="/login" component={LoginPage} />
          <Route exact key="/signup" path="/signup" component={SignUpPage} />
          <Route
            exact
            key="/account"
            path="/account/:id"
            component={AccountPage}
          />
          <Route
            exact
            key="/contest"
            path="/contest/:contestId"
            component={ContestPage}
          />
          <Route component={NotFoundPage} />
        </Switch>
      </div>
    </Router>
  );
};
