import React, { useState, useEffect } from 'react';
import { 
  Container, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Chip,
  Box, Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EntityToolbar from '../components/EntityToolbar';
import EntityDetails from '../components/EntityViews/EntityDetails';
import EntityForm from '../components/EntityViews/EntityForm';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { 
  ApartmentOutlined as BuildingIcon,
  PeopleOutlined as PeopleIcon,
  DescriptionOutlined as DescriptionIcon,
  Inventory2Outlined as InventoryIcon
} from '@mui/icons-material';

export function Habitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  // Cargar datos iniciales
  useEffect(() => {
    fetchHabitaciones();
    fetchPropiedades();
  }, []);

  const fetchHabitaciones = async () => {
    try {
      const response = await axios.get('/api/habitaciones');
      setHabitaciones(response.data);
    } catch (error) {
      console.error('Error al cargar habitaciones:', error);
      enqueueSnackbar('Error al cargar habitaciones', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPropiedades = async () => {
    try {
      const response = await axios.get('/api/propiedades');
      setPropiedades(response.data);
    } catch (error) {
      console.error('Error al cargar propiedades:', error);
      enqueueSnackbar('Error al cargar propiedades', { variant: 'error' });
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const datosAEnviar = {
        numero: formData.numero,
        tipo: formData.tipo,
        estado: formData.estado,
        descripcion: formData.descripcion,
        propiedadId: parseInt(formData.propiedadId),
        metrosCuadrados: parseFloat(formData.metrosCuadrados),
        precio: parseFloat(formData.precio)
      };

      console.log('Enviando datos:', datosAEnviar);

      const response = await axios.post('/api/habitaciones', datosAEnviar);
      
      if (response.status === 201) {
        enqueueSnackbar('Habitación creada exitosamente', { variant: 'success' });
        setIsFormOpen(false);
        fetchHabitaciones();
      }
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar(
        error.response?.data?.error || 'Error al crear la habitación', 
        { variant: 'error' }
      );
    }
  };

  const formFields = [
    {
      name: 'numero',
      label: 'Número de Habitación',
      type: 'text',
      required: true
    },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: [
        { value: 'INDIVIDUAL', label: 'Individual' },
        { value: 'DOBLE', label: 'Doble' },
        { value: 'SUITE', label: 'Suite' },
        { value: 'COMPARTIDA', label: 'Compartida' }
      ]
    },
    {
      name: 'propiedadId',
      label: 'Propiedad',
      type: 'select',
      required: true,
      options: propiedades.map(prop => ({
        value: prop.id,
        label: `${prop.titulo} - ${prop.direccion}`
      }))
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { value: 'DISPONIBLE', label: 'Disponible' },
        { value: 'OCUPADA', label: 'Ocupada' },
        { value: 'MANTENIMIENTO', label: 'En Mantenimiento' },
        { value: 'RESERVADA', label: 'Reservada' }
      ]
    },
    {
      name: 'metrosCuadrados',
      label: 'Metros Cuadrados',
      type: 'number',
      required: true
    },
    {
      name: 'precio',
      label: 'Precio',
      type: 'number',
      required: true
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'text',
      multiline: true,
      rows: 3
    }
  ];

  return (
    <Container maxWidth="lg">
      <EntityToolbar
        onAdd={() => setIsFormOpen(true)}
        searchPlaceholder="Buscar habitaciones..."
        navigationItems={[
          {
            icon: <BuildingIcon sx={{ fontSize: 20 }} />,
            label: 'Propiedades',
            to: '/propiedades'
          },
          {
            icon: <PeopleIcon sx={{ fontSize: 20 }} />,
            label: 'Inquilinos',
            to: '/inquilinos'
          },
          {
            icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
            label: 'Contratos',
            to: '/contratos'
          },
          {
            icon: <InventoryIcon sx={{ fontSize: 20 }} />,
            label: 'Inventario',
            to: '/inventario'
          }
        ]}
      />

      <EntityDetails
        title="Habitaciones"
        action={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            size="small"
            onClick={() => setIsFormOpen(true)}
          >
            Nueva Habitación
          </Button>
        }
      >
        {habitaciones.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="h6" gutterBottom>
              No hay habitaciones registradas
            </Typography>
            <Button 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsFormOpen(true)}
              sx={{ mt: 2 }}
            >
              Agregar Habitación
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Propiedad</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Metros²</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell>Descripción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {habitaciones.map((hab) => (
                  <TableRow key={hab.id}>
                    <TableCell>{hab.numero}</TableCell>
                    <TableCell>{hab.propiedad?.titulo}</TableCell>
                    <TableCell>{hab.tipo}</TableCell>
                    <TableCell>
                      <Chip 
                        label={hab.estado}
                        color={
                          hab.estado === 'DISPONIBLE' ? 'success' : 
                          hab.estado === 'OCUPADA' ? 'error' : 
                          hab.estado === 'MANTENIMIENTO' ? 'warning' : 
                          'default'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">{hab.metrosCuadrados}</TableCell>
                    <TableCell align="right">{hab.precio}</TableCell>
                    <TableCell>{hab.descripcion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </EntityDetails>

      <EntityForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        title="Nueva Habitación"
        fields={formFields}
      />
    </Container>
  );
}

export default Habitaciones; 