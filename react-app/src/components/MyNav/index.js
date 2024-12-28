import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import axios from '../../api/axios';
import './style.css';

function MyNav({ isAdmin, showGifs }) {
  const handleLogout = async () => {
    try {
      await axios.get('/logout', { withCredentials: true });
      window.location.href = '/';
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Navbar bg="light" expand="md" className="mb-3 myNav" sticky="top">
      {showGifs && (
        <div className="gifContainer">
          <img
            style={{ width: "100px" }}
            src="/dance1.gif"
            alt="pokemon dancing"
          />
          <img
            style={{ width: "140px" }}
            id="pikaGif"
            src="/dance2.gif"
            alt="pikachu dancing"
          />
        </div>
      )}
      <Container fluid>
        <div id="navLogoContainer" className="d-flex align-items-center">
          <img src="/favicon.ico" id="logoImg" alt="pokedex logo" />
          <Navbar.Brand href="#" className="title">Pokédex</Navbar.Brand>
        </div>

        <Navbar.Toggle aria-controls="offcanvasNavbar" />
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3 navLinks">
              {isAdmin && <Nav.Link href="/admin">Dashboard</Nav.Link>}
              <Nav.Link href="/pokemons">Pokémons</Nav.Link>
            </Nav>
            <Button variant="outline-danger" onClick={handleLogout} className="logout-btn">
              Logout
            </Button>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default MyNav;
