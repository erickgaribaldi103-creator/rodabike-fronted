import { useState, useEffect } from 'react';

function App() {
  const [bicicletas, setBicicletas] = useState([]);
  
  // NUEVO 1: Agregamos estados de memoria para los nuevos filtros
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroMarca, setFiltroMarca] = useState('Todas');
  const [filtroPrecio, setFiltroPrecio] = useState('Todos');
  
  const [vista, setVista] = useState('catalogo'); 
  const [esAdmin, setEsAdmin] = useState(false);
  const [biciEnEdicion, setBiciEnEdicion] = useState(null);
  
  const [formulario, setFormulario] = useState({
    nombre: '', marca: '', categoria: 'Montaña', precio: '', descripcion: '', imagenUrl: ''
  });

  useEffect(() => {
    fetch('https://rodabike-backend-1.onrender.com/api/bicicletas')
      .then(res => res.json())
      .then(datos => setBicicletas(datos))
      .catch(error => console.error("Error al traer los datos:", error));
  }, []);

  const manejarCambio = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const iniciarEdicion = (bici) => {
    setFormulario({
      nombre: bici.nombre, marca: bici.marca, categoria: bici.categoria, 
      precio: bici.precio, descripcion: bici.descripcion, imagenUrl: bici.imagenUrl
    });
    setBiciEnEdicion(bici.id);
    setVista('formulario');
    window.scrollTo(0, 0);
  };

  const cancelarFormulario = () => {
    setVista('catalogo');
    setBiciEnEdicion(null);
    setFormulario({ nombre: '', marca: '', categoria: 'Montaña', precio: '', descripcion: '', imagenUrl: '' });
  };

  const guardarBicicleta = (e) => {
    e.preventDefault(); 
    const datosParaGuardar = {
      ...formulario,
      precio: Number(formulario.precio),
      stock: 5,
      especificaciones: { tipoFrenos: "Disco", velocidades: 18, materialCuadro: "Aluminio" }
    };

    if (biciEnEdicion) {
      fetch(`http://localhost:3000/api/bicicletas/${biciEnEdicion}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaGuardar)
      })
      .then(res => res.json())
      .then(biciActualizada => {
        const nuevaLista = bicicletas.map(b => b.id === biciEnEdicion ? biciActualizada : b);
        setBicicletas(nuevaLista);
        cancelarFormulario();
      });
    } else {
      fetch('http://localhost:3000/api/bicicletas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaGuardar)
      })
      .then(res => res.json())
      .then(biciGuardada => {
        setBicicletas([...bicicletas, biciGuardada]);
        cancelarFormulario();
      });
    }
  };

  const eliminarBicicleta = (id) => {
    if(window.confirm("¿Estás seguro de que quieres eliminar esta bicicleta?")) {
      fetch(`http://localhost:3000/api/bicicletas/${id}`, { method: 'DELETE' })
      .then(() => {
        const nuevaLista = bicicletas.filter(bici => bici.id !== id);
        setBicicletas(nuevaLista);
      })
      .catch(error => console.error("Error al eliminar:", error));
    }
  };

  const alternarAdministrador = () => {
    if (esAdmin) {
      setEsAdmin(false); 
      cancelarFormulario();
    } else {
      const password = prompt("Ingresa la contraseña de RodaBike:");
      if (password === "roda2026") {
        setEsAdmin(true);
      } else if (password !== null) {
        alert("Contraseña incorrecta.");
      }
    }
  };

  // NUEVO 2: Obtenemos una lista automática de las marcas disponibles sin repetirlas
  const marcasDisponibles = ['Todas', ...new Set(bicicletas.map(bici => bici.marca))];

  // NUEVO 3: Súper filtro dinámico. La bici debe pasar por los 3 "coladores" para mostrarse
  const bicicletasFiltradas = bicicletas.filter(bici => {
    // Colador de Categoría
    const pasaCategoria = filtroCategoria === 'Todas' || bici.categoria === filtroCategoria;
    
    // Colador de Marca
    const pasaMarca = filtroMarca === 'Todas' || bici.marca === filtroMarca;
    
    // Colador de Precio
    let pasaPrecio = true;
    if (filtroPrecio === 'Economicas') pasaPrecio = bici.precio < 5000;
    if (filtroPrecio === 'Medias') pasaPrecio = bici.precio >= 5000 && bici.precio <= 15000;
    if (filtroPrecio === 'Premium') pasaPrecio = bici.precio > 15000;

    return pasaCategoria && pasaMarca && pasaPrecio;
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ flexGrow: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#2D5016' }}>RodaBike 🚲</h1>
          
          {esAdmin && (
            <div style={{ gap: '10px', display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
              <button onClick={cancelarFormulario} style={estiloBotonNav(vista === 'catalogo')}>Ver Catálogo</button>
              <button onClick={() => { cancelarFormulario(); setVista('formulario'); }} style={estiloBotonNav(vista === 'formulario' && !biciEnEdicion)}>+ Agregar Bicicleta</button>
            </div>
          )}
        </div>

        {vista === 'catalogo' && (
          <>
            {/* ZONA DE FILTROS */}
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto 30px auto' }}>
              <h3 style={{ marginTop: 0, textAlign: 'center', color: '#1A1A1A' }}>🔎 Encuentra tu bicicleta ideal</h3>
              
              {/* Botones de Categoría */}
              <div style={{ textAlign: 'center', marginBottom: '15px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <button onClick={() => setFiltroCategoria('Todas')} style={estiloBoton(filtroCategoria === 'Todas')}>Todas</button>
                <button onClick={() => setFiltroCategoria('Montaña')} style={estiloBoton(filtroCategoria === 'Montaña')}>Montaña</button>
                <button onClick={() => setFiltroCategoria('Urbana')} style={estiloBoton(filtroCategoria === 'Urbana')}>Urbana</button>
                <button onClick={() => setFiltroCategoria('Infantil')} style={estiloBoton(filtroCategoria === 'Infantil')}>Infantil</button>
                <button onClick={() => setFiltroCategoria('Eléctrica')} style={estiloBoton(filtroCategoria === 'Eléctrica')}>Eléctrica</button>
              </div>

              {/* NUEVO 4: Selectores de Marca y Precio */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Marca:</label>
                  <select value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)} style={estiloInput}>
                    {marcasDisponibles.map(marca => (
                      <option key={marca} value={marca}>{marca}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Rango de Precio:</label>
                  <select value={filtroPrecio} onChange={(e) => setFiltroPrecio(e.target.value)} style={estiloInput}>
                    <option value="Todos">Cualquier precio</option>
                    <option value="Economicas">Menos de $5,000</option>
                    <option value="Medias">$5,000 a $15,000</option>
                    <option value="Premium">Más de $15,000</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AVISO SI NO HAY RESULTADOS */}
            {bicicletasFiltradas.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <h2>No encontramos bicicletas con esos filtros 😕</h2>
                <p>Intenta cambiar la categoría, marca o rango de precio.</p>
                <button onClick={() => { setFiltroCategoria('Todas'); setFiltroMarca('Todas'); setFiltroPrecio('Todos'); }} style={{ ...estiloBoton(true), marginTop: '10px' }}>
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* LISTA DE BICICLETAS */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {bicicletasFiltradas.map(bici => (
                <div key={bici.id} style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '10px', width: '280px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                  <img src={bici.imagenUrl} alt={bici.nombre} style={{ width: '100%', height: '200px', objectFit: 'cover', backgroundColor: '#eee' }} />
                  
                  <div style={{ padding: '15px', flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ color: '#1A1A1A', margin: '0 0 5px 0' }}>{bici.nombre}</h2>
                      <span style={{ backgroundColor: '#2D5016', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{bici.categoria}</span>
                    </div>
                    
                    <p style={{ marginTop: '5px' }}><strong>Marca:</strong> {bici.marca}</p>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>{bici.descripcion}</p>
                    
                    <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px', fontSize: '0.85rem', color: '#555' }}>
                      <p style={{ margin: '3px 0' }}>⚙️ <strong>Cuadro:</strong> {bici.especificaciones?.materialCuadro || 'N/A'}</p>
                      <p style={{ margin: '3px 0' }}>⚙️ <strong>Frenos:</strong> {bici.especificaciones?.tipoFrenos || 'N/A'}</p>
                      <p style={{ margin: '3px 0' }}>⚙️ <strong>Velocidades:</strong> {bici.especificaciones?.velocidades || 'N/A'}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                      <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2D5016', margin: '0' }}>${bici.precio} MXN</p>
                      <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: 'bold', color: bici.stock > 0 ? '#28a745' : '#dc3545' }}>
                        {bici.stock > 0 ? `✅ Disp: ${bici.stock}` : '❌ Agotada'}
                      </p>
                    </div>
                  </div>

                  {esAdmin && (
                    <div style={{ padding: '10px 15px', borderTop: '1px solid #eee', backgroundColor: '#fafafa', display: 'flex', gap: '10px' }}>
                      <button onClick={() => iniciarEdicion(bici)} style={{ flex: 1, backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>✏️ Editar</button>
                      <button onClick={() => eliminarBicicleta(bici.id)} style={{ flex: 1, backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Borrar</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ... (Formulario) ... */}
        {vista === 'formulario' && esAdmin && (
          <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#2D5016' }}>
              {biciEnEdicion ? '✏️ Editar Bicicleta' : '✨ Agregar Nuevo Modelo'}
            </h2>
            <form onSubmit={guardarBicicleta} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input required name="nombre" value={formulario.nombre} onChange={manejarCambio} placeholder="Nombre del modelo" style={estiloInput} />
              <input required name="marca" value={formulario.marca} onChange={manejarCambio} placeholder="Marca" style={estiloInput} />
              <select name="categoria" value={formulario.categoria} onChange={manejarCambio} style={estiloInput}>
                <option value="Montaña">Montaña</option>
                <option value="Urbana">Urbana</option>
                <option value="Infantil">Infantil</option>
                <option value="Eléctrica">Eléctrica</option>
              </select>
              <input required name="precio" type="number" value={formulario.precio} onChange={manejarCambio} placeholder="Precio" style={estiloInput} />
              <textarea required name="descripcion" value={formulario.descripcion} onChange={manejarCambio} placeholder="Descripción..." style={{...estiloInput, height: '80px'}} />
              <input required name="imagenUrl" value={formulario.imagenUrl} onChange={manejarCambio} placeholder="URL de la imagen" style={estiloInput} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={cancelarFormulario} style={{ flex: 1, backgroundColor: '#6c757d', color: 'white', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>Cancelar</button>
                <button type="submit" style={{ flex: 2, backgroundColor: '#2D5016', color: 'white', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>{biciEnEdicion ? 'Guardar Cambios' : 'Guardar Bicicleta'}</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <footer style={{ marginTop: '50px', padding: '30px', borderTop: '4px solid #2D5016', backgroundColor: '#1A1A1A', color: 'white', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '20px' }}>
        <div>
          <h3 style={{ color: '#4CAF50', margin: '0 0 10px 0' }}>📍 Ubicación</h3>
          <p style={{ margin: '5px 0' }}>Av. Juárez 234</p>
          <p style={{ margin: '5px 0' }}>Centro Histórico, Xalapa</p>
        </div>
        <div>
          <h3 style={{ color: '#4CAF50', margin: '0 0 10px 0' }}>🕒 Horario</h3>
          <p style={{ margin: '5px 0' }}>Lun - Sáb: 10:00 AM - 8:00 PM</p>
          <p style={{ margin: '5px 0' }}>Domingos: 11:00 AM - 5:00 PM</p>
        </div>
        <div>
          <h3 style={{ color: '#4CAF50', margin: '0 0 10px 0' }}>📞 Contacto</h3>
          <p style={{ margin: '5px 0' }}>📱 WhatsApp: (228) 123-4567</p>
          <p style={{ margin: '5px 0' }}>☎️ Teléfono: (228) 765-4321</p>
        </div>
        <div style={{ width: '100%', textAlign: 'center', marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
          <button onClick={alternarAdministrador} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}>
            {esAdmin ? 'Cerrar sesión de Administrador' : 'Acceso empleados'}
          </button>
        </div>
      </footer>

    </div>
  );
}

function estiloBotonNav(activo) {
  return { padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '5px', backgroundColor: activo ? '#1A1A1A' : '#ddd', color: activo ? 'white' : 'black', fontWeight: 'bold' };
}
function estiloBoton(activo) {
  return { padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '5px', backgroundColor: activo ? '#2D5016' : '#ddd', color: activo ? 'white' : 'black', fontWeight: 'bold' };
}
const estiloInput = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'Arial', minWidth: '200px' };

export default App;