import React, { useRef } from 'react';
import MovieCard from './MovieCard';

export default function Carousel({ peliculas, onCambiarEstado, onAbrirDetalles }) {
  const contenedorRef = useRef(null);

  const desplazar = (direccion) => {
    if (contenedorRef.current) {
      const distancia = 320;
      contenedorRef.current.scrollBy({
        left: direccion === 'izquierda' ? -distancia : distancia,
        behavior: 'smooth'
      });
    }
  };

  if (!peliculas || peliculas.length === 0) {
    return <p className="text-muted small p-2">No hay películas disponibles.</p>;
  }

  return (
    <div className="posicion-carrusel position-relative">
      <button className="btn-flecha flecha-izq" onClick={() => desplazar('izquierda')}>
        <i className="bi bi-chevron-left"></i>
      </button>
      
      <div ref={contenedorRef} className="contenedor-carrusel">
        {peliculas.map(peli => (
          <MovieCard 
            key={peli.id} 
            peli={peli} 
            onCambiarEstado={onCambiarEstado} 
            onAbrirDetalles={onAbrirDetalles} 
          />
        ))}
      </div>

      <button className="btn-flecha flecha-der" onClick={() => desplazar('derecha')}>
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
}