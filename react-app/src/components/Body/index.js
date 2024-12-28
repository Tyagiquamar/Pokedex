import React, { useEffect } from "react";
import "./styles.css";
import { FaRegStar, FaStar } from "react-icons/fa";
import axios from "../../api/axios";

function PokemonGrid({ pokemons, setCurrentPokemon, toggleModal, userFavorites, updateFavorites }) {

  useEffect(() => {
    const fetchUserFavorites = async () => {
      try {
        const response = await axios.get('/favorites', { withCredentials: true });
        console.log('Fetched user favorites:', response.data);
        const favoritesList = response.data || [];
        updateFavorites(favoritesList);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    fetchUserFavorites();
  }, [updateFavorites]);

  const generateImageUrl = (id) => {
    let formattedId = id.padStart(3, '0');
    if (formattedId === '662') formattedId += 'r';
    if (formattedId === '740') formattedId += 'le';
    return `https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/${formattedId}.png`;
  };

  const handlePokemonClick = (pokemon) => {
    setCurrentPokemon({ ...pokemon, img: generateImageUrl(String(pokemon.id)) });
    toggleModal(true);
  };

  const handleFavoriteToggle = async (e, pokemonId) => {
    e.stopPropagation();
    try {
      if (userFavorites.includes(pokemonId)) {
        updateFavorites(userFavorites.filter((id) => id !== pokemonId));
        await axios.patch(`/removeFavorite/${pokemonId}`, {}, { withCredentials: true });
      } else {
        updateFavorites([...userFavorites, pokemonId]);
        await axios.patch(`/addFavorite/${pokemonId}`, {}, { withCredentials: true });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  return (
    <div className="pokemonGrid">
      {pokemons.map((pokemon, idx) => (
        <div key={idx} onClick={() => handlePokemonClick(pokemon)} className="pokemonCard">
          <img className="pokemonImage" alt={pokemon.name.english} src={generateImageUrl(String(pokemon.id))} />
          <div className="cardDetails">
            {userFavorites.includes(pokemon.id) ? (
              <FaStar size={18} onClick={(e) => handleFavoriteToggle(e, pokemon.id)} className="favoriteIcon" />
            ) : (
              <FaRegStar size={18} onClick={(e) => handleFavoriteToggle(e, pokemon.id)} className="favoriteIcon" />
            )}
            <p>#{pokemon.id} {pokemon.name.english}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PokemonGrid;
