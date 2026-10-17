import React, { useState } from 'react';

export default function Modals({ peliculaSeleccionada, onAgregarPelicula }) {
  const [nuevaPeli, setNuevaPeli] = useState({
    titulo: '',
    nota: '',
    duracion: '',
    imagen: '',
    trailer: '',
    generos: '',
    sinopsis: ''
  });

  const handleChange = (e) => {
    setNuevaPeli({ ...nuevaPeli, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const peliGuardar = {
      ...nuevaPeli,
      id: Date.now().toString(),
      fecha: new Date().toISOString().split("T")[0],
      votos: "1",
      generos: nuevaPeli.generos.split(',').map(g => g.trim()),
      categoria: "emision",
      estadoPerfil: "ninguno"
    };

    onAgregarPelicula(peliGuardar);
    setNuevaPeli({
      titulo: '', nota: '', duracion: '', imagen: '', trailer: '', generos: '', sinopsis: ''
    });

    // Cerrar modal vía Bootstrap Data Attribute
    const modalElem = document.getElementById("modalAgregarPelicula");
    if (window.bootstrap?.Modal) {
      const modalInstance = window.bootstrap.Modal.getInstance(modalElem);
      if (modalInstance) modalInstance.hide();
    }
  };

  return (
    <>
      {/* MODAL AGREGAR PELÍCULA (ADMIN) */}
      <div className="modal fade" id="modalAgregarPelicula" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-modal text-white border-0 shadow-lg">
            <div className="modal-header border-secondary">
              <h5 className="modal-title fw-bold text-primary"><i className="bi bi-film"></i> Añadir Nueva Película</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Título</label>
                  <input type="text" id="titulo" value={nuevaPeli.titulo} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="Ej: Spider-Man" required />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small text-muted">Nota IMDb</label>
                    <input type="number" step="0.1" max="10" min="0" id="nota" value={nuevaPeli.nota} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="8.5" required />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Duración</label>
                    <input type="text" id="duracion" value={nuevaPeli.duracion} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="2h 15m" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">URL de la Imagen (Póster)</label>
                  <input type="url" id="imagen" value={nuevaPeli.imagen} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="https://..." required />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">URL del Tráiler (YouTube)</label>
                  <input type="url" id="trailer" value={nuevaPeli.trailer} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="https://www.youtube.com/..." />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Géneros (separados por coma)</label>
                  <input type="text" id="generos" value={nuevaPeli.generos} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="Acción, Ciencia Ficción" />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Sinopsis</label>
                  <textarea id="sinopsis" value={nuevaPeli.sinopsis} onChange={handleChange} className="form-control bg-dark text-white border-secondary" rows="3" placeholder="Resumen..."></textarea>
                </div>
                <div className="d-flex justify-content-end gap-2 pt-2">
                  <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" className="btn btn-success btn-sm fw-bold px-4">Guardar Película</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DETALLES DE PELÍCULA */}
      <div className="modal fade" id="modalPelicula" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content bg-modal text-white border-0 shadow-lg">
            <div className="modal-body p-4 position-relative">
              <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3 z-3" data-bs-dismiss="modal"></button>
              
              {peliculaSeleccionada && (
                <div className="row g-4 align-items-center">
                  <div className="col-md-5 text-center">
                    <img src={peliculaSeleccionada.imagen} className="img-fluid rounded-3 shadow" alt={peliculaSeleccionada.titulo} />
                  </div>
                  <div className="col-md-7">
                    <h2 className="fw-bold text-white mb-1">{peliculaSeleccionada.titulo}</h2>
                    <p className="text-secondary fst-italic small mb-3">{peliculaSeleccionada.tagline || ''}</p>
                    <p className="text-light small lh-base mb-3">{peliculaSeleccionada.sinopsis || 'Sin sinopsis disponible.'}</p>
                    
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-2 fw-bold">Géneros</span>
                      <div className="d-flex flex-wrap gap-2">
                        {peliculaSeleccionada.generos?.map((g, idx) => (
                          <span key={idx} className="badge bg-secondary extra-small">{g}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <a 
                        href={peliculaSeleccionada.trailer || '#'} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-danger btn-sm fw-bold px-3 d-inline-flex align-items-center gap-2"
                      >
                        <i className="bi bi-youtube fs-5"></i> Ver Tráiler
                      </a>
                    </div>

                    <div className="row g-2 mt-2 text-center">
                      <div className="col-6 col-md-4">
                        <div className="bg-dark p-2 rounded border border-secondary">
                          <small className="text-muted d-block extra-small">Director</small>
                          <span className="fw-bold text-white small">{peliculaSeleccionada.director || 'Desconocido'}</span>
                        </div>
                      </div>
                      <div className="col-6 col-md-4">
                        <div className="bg-dark p-2 rounded border border-secondary">
                          <small className="text-muted d-block extra-small">Fecha</small>
                          <span className="fw-bold text-white small">{peliculaSeleccionada.fecha || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-6 col-md-4">
                        <div className="bg-dark p-2 rounded border border-secondary">
                          <small className="text-muted d-block extra-small">Duración</small>
                          <span className="fw-bold text-white small">{peliculaSeleccionada.duracion || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="bg-dark p-2 rounded border border-secondary">
                          <small className="text-muted d-block extra-small">Rating</small>
                          <span className="fw-bold text-warning small">{peliculaSeleccionada.rating || peliculaSeleccionada.nota || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="bg-dark p-2 rounded border border-secondary">
                          <small className="text-muted d-block extra-small">Votos</small>
                          <span className="fw-bold text-white small">{peliculaSeleccionada.votos || '0'}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}