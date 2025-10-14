import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import Button from '@mui/material/Button'; // Importar Button
import RefreshIcon from '@mui/icons-material/Refresh'; // Importar RefreshIcon
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { GridActionsCellItem } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import Chip from '@mui/material/Chip';
import {
  DataGrid,
  Toolbar,
  QuickFilter,
  ExportCsv,
  ExportPrint,
  ToolbarButton,
  QuickFilterControl,
  QuickFilterClear,
} from '@mui/x-data-grid';

import Tooltip from '@mui/material/Tooltip';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import { styled } from '@mui/material/styles';


function randomColor() {
  const colors = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Renderiza el avatar
function renderAvatar(params) {
  if (!params.value) return null;
  return (
    <Avatar
      sx={{
        bgcolor: params.value.color,
        width: '40px',
        fontSize: 14,
        fontFamily: 'Roboto, sans-serif',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'center',   // <-- centra horizontalmente dentro de la celda
        alignItems: 'center',       // <-- centra verticalmente dentro de la celda
        padding: 3,
        height: '80%' // asegura centrado vertical,
        
      }}
    >
      {params.value.initials}
    </Avatar>
  );
}
function EditUserModal({ open, onClose, initialRowData, onSave }) {
  const [formData, setFormData] = React.useState(initialRowData || {});

  React.useEffect(() => {
    setFormData(initialRowData || {});
  }, [initialRowData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ component: 'form', onSubmit: handleSubmit }}>
      <DialogTitle>Editar usuario</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <DialogContentText>
          Realiza cambios en la información del usuario.
        </DialogContentText>
        <TextField
          autoFocus
          required
          margin="dense"
          id="nombre"
          name="nombre"
          label="Nombre"
          fullWidth
          value={formData.nombre || ''}
          onChange={handleChange}
        />
        <TextField
          required
          margin="dense"
          id="apellido"
          name="apellido"
          label="Apellido"
          fullWidth
          value={formData.apellido || ''}
          onChange={handleChange}
        />
        <TextField
          required
          margin="dense"
          id="email"
          name="email"
          label="Email"
          fullWidth
          value={formData.email || ''}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          id="telefono"
          name="telefono"
          label="Teléfono"
          fullWidth
          value={formData.telefono || ''}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="submit">Guardar cambios</Button>
      </DialogActions>
    </Dialog>
  );
}
// Estilizar el QuickFilter para que se alinee a la izquierda (removiendo marginLeft: 'auto')
const StyledQuickFilter = styled(QuickFilter)({
  // No hay marginLeft: 'auto' para que se mantenga a la izquierda
});

function CustomToolbar({ onRefresh }) {
  return (
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      <StyledQuickFilter expanded>
        <QuickFilterControl
          render={({ ref, ...other }) => (
            <TextField
              {...other}
              sx={{ width: 260 }}
              inputRef={ref}
              aria-label="Buscar"
              placeholder="Buscar..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: other.value ? (
                    <InputAdornment position="end">
                      <QuickFilterClear
                        edge="end"
                        size="small"
                        aria-label="Limpiar búsqueda"
                        material={{ sx: { marginRight: -0.75 } }}
                      >
                        <CancelIcon fontSize="small" />
                      </QuickFilterClear>
                    </InputAdornment>
                  ) : null,
                  ...other.slotProps?.input,
                },
                ...other.slotProps,
              }}
            />
          )}
        />
      </StyledQuickFilter>
      {/* Agrupa los botones en un Box para que estén juntos */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
        >
          Actualizar
        </Button>
        <Tooltip title="Download as CSV">
          <ExportCsv render={<ToolbarButton />}>
            <FileDownloadIcon fontSize="small" />
          </ExportCsv>
        </Tooltip>
        <Tooltip title="Print">
          <ExportPrint render={<ToolbarButton />}>
            <PrintIcon fontSize="small" />
          </ExportPrint>
        </Tooltip>
      </Box>
    </Toolbar>
  );
}

export default function GestionUsuarios() {
  const [refreshKey, setRefreshKey] = React.useState(0); // Estado para forzar la actualización
  const [rows, setRows] = React.useState([]);
  const [selectedRowForEdit, setSelectedRowForEdit] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedRowForDelete, setSelectedRowForDelete] = React.useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1); // Incrementar la clave para forzar re-render
  };



  React.useEffect(() => {
    // Cambia la URL al endpoint correcto que traiga todos los usuarios
    setLoading(true);
    fetch('https://localhost:4000/api/v1/users',{
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        // Si data es un array de usuarios
        console.log(data);
        
        const mappedRows = data.map((user) => ({
          ...user,
          id: user.id,
          avatar: {
            initials: `${user.nombre?.[0] || ''}${user.apellido?.[0] || ''}`,
            color: randomColor(),
          },
          roles: Array.isArray(user.roles) ? user.roles : []
        }));
        setRows(mappedRows);
      })
      .catch((error) => {
        console.error('Error al obtener los usuarios:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refreshKey]);


  const handleDeleteClick = (id) => () => {
    const rowToDelete = rows.find((row) => row.id === id);
    setSelectedRowForDelete(rowToDelete);
    setIsDeleteModalOpen(true);
};

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRowForDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedRowForDelete) return;
    fetch(`https://localhost:4000/api/v1/users/${selectedRowForDelete.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(() => {
        handleRefresh();
        handleCloseDeleteModal();
      });
  };


  const handleEditClick = (id) => () => {
    const rowToEdit = rows.find((row) => row.id === id);
    setSelectedRowForEdit(rowToEdit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRowForEdit(null);
  };


  const handleSaveEdit = (updatedRow) => {
  // Aquí deberías hacer el fetch/PUT a tu API, ejemplo:
  fetch(`https://localhost:4000/api/v1/users/${updatedRow.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(updatedRow),
  })
    .then((response) => response.json())
    .then(() => {
      // Refresca después de guardar
      handleRefresh();
      handleCloseModal();
    });
};

  const columns = [
    {
      field: 'avatar',
      headerName: 'Avatar',
      width: 100,
      renderCell: renderAvatar,
      sortable: false,
      filterable: false,
    },
    { field: 'nombre', headerName: 'Nombre', width: 200 },
    { field: 'apellido', headerName: 'Apellido', width: 200 },
    { field: 'email', headerName: 'Email', width: 365 },
    { field: 'telefono', headerName: 'Teléfono', width: 150 },
    {
      field: 'roles',
      headerName: 'Roles',
      width: 300,
      sortable: false,
      align: 'center',             // <-- IMPORTANTE: centra el contenido horizontalmente
      headerAlign: 'center',       // <-- centra el título
      renderCell: (params) =>
        Array.isArray(params.value) && params.value.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              flexWrap: 'wrap',
              justifyContent: 'center',   // <-- centra horizontalmente dentro de la celda
              alignItems: 'center',       // <-- centra verticalmente dentro de la celda
              width: '100%',
              height: '100%', // asegura centrado vertical
            }}
          >
            {params.value.map((role, idx) => (
              <Chip
                key={idx}
                label={role}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: '16px',
                  bgcolor: '#f8fff7',
                  color: '#219653',
                  borderColor: '#08e44dff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  px: 1.2,
                  height: 30
                }}
              />
            ))}
          </Box>
        ) : null
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 300,
      getActions: ({ id }) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={handleEditClick(id)}
          color="inherit"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Eliminar"
          onClick={handleDeleteClick(id)}
          color="error"
        />
      ],
    },
  ];


  return (
    <>
      <br />
      <h1>Usuarios</h1>
      <Box sx={{ height: '100vh', width: '100%', m: 2 }}>
        <DataGrid
          key={refreshKey} // Usar la clave para forzar la actualización
          rows={rows}
          columns={columns}
          loading={loading}
          slots={{ toolbar: CustomToolbar }}
          slotProps={{ 
            toolbar: { 
              onRefresh: handleRefresh 
            },
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton',
            },
           }} // Pasar handleRefresh a la toolbar
          showToolbar 
        />
      {selectedRowForEdit && (
        <EditUserModal
          open={isModalOpen}
          onClose={handleCloseModal}
          initialRowData={selectedRowForEdit}
          onSave={handleSaveEdit} />
      )}
      {selectedRowForDelete && (
        <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal}>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Seguro que deseas eliminar al usuario <b>{selectedRowForDelete.nombre} {selectedRowForDelete.apellido}</b>? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteModal}>Cancelar</Button>
            <Button color="error" onClick={handleConfirmDelete}>Eliminar</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  </>
  );
}