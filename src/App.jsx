import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import UnitView from './components/course/UnitView.jsx'
import Converter from './pages/Converter.jsx'
import Practice from './pages/Practice.jsx'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/unidad/:id" element={<UnitView />} />
          <Route path="/convertidor" element={<Converter />} />
          <Route path="/practica" element={<Practice />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
