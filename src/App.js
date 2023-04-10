import Home from "./components/pages/Home";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GlobalStyles from "./components/GlobalStyle";
import Login from "./components/pages/Login";
import Signup from "./components/pages/Signup";
import Profile from "./components/pages/Profile";
import { useContext, useState, useCallback } from "react";
import { AuthContext } from "./contexts/AuthContext/AuthContext";
import { NotificationContainer } from "react-notifications";
import './axios-conf'
import NftDashboard from "./components/pages/NftDashboard";
import Marketplace from "./components/pages/Marketplace";
import MyListedItems from "./components/pages/MyListedItems";

function App() {
  const { user } = useContext(AuthContext);
  const [rerenderFeed, setRerenderFeed] = useState(0);

  const handleChange = useCallback((newValue) => {
    setRerenderFeed(newValue);
  }, []);
  return (
    <>
      <GlobalStyles />
      <NotificationContainer />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Home rerenderFeed={rerenderFeed} onChange={handleChange} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
           <Route
            path="/signup"
            element={user ? <Navigate to="/" /> : <Signup />}
          />
          <Route
            path="/profile/:email"
            element={
              user ? (
                <Profile rerenderFeed={rerenderFeed} onChange={handleChange} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
            <Route
                path="/nft-dashboard/:email"
                element={
                    user ? (
                        <NftDashboard rerenderFeed={rerenderFeed} onChange={handleChange}/>
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />
            <Route
                path="/listed-nft"
                element={
                    user ? (
                        <MyListedItems rerenderFeed={rerenderFeed} onChange={handleChange}/>
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />

            <Route
                path="/marketplace"
                element={
                    user ? (
                        <Marketplace rerenderFeed={rerenderFeed} onChange={handleChange}/>
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
