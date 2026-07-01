import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import TreinosPublicados from "./pages/TreinoPublicado/TreinosPublicados";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route 
                    path="/treinos-publicados"
                    element={<TreinosPublicados />}
                />

            </Routes>

        </BrowserRouter>

    )

}

export default App;