import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { formatCOP } from '../../services/currency';
import Chip from '@mui/material/Chip';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export default function CustomizedDataGrid() {
  const [token, setToken] = React.useState(null);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert("no esta atenticado");
    }
  });

  React.useEffect(() => {
    if (!token) return;

    fetch("https://localhost:4000/api/v1/orders", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .filter((order) => order.status === "pagada")
          .map((order) => ({
            id: order.id,
            numeroOrder: `#${order.numero_de_orden}`,
            status: order.status,
            clientes: order.clientes,
            email: order.email || "N/A",
            total: `${formatCOP(order.pago_total)}`,
            fecha: new Date(order.fecha_pago).toLocaleDateString(),
            pdf_url: order.pdf_url,
          }));
        setRows(formatted);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))

  }, [token]);

  const columns = [
    { field: "numeroOrder", headerName: "Número Orden", flex: 1 },
    {
      field: "status",
      headerName: "Estado",
      flex: 1,
      renderCell: (params) => {
        const color =
          params.value === "pagada"
            ? "success"
            : params.value === "Pendiente"
              ? "warning"
              : "error";
        return <Chip label={params.value} color={color} size="small" />;
      },
    },
    { field: "clientes", headerName: "Cliente", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "total", headerName: "Total", flex: 1 },
    { field: "fecha", headerName: "Fecha", flex: 1 },
    {
      field: "pdf",
      headerName: "Factura",
      flex: 1,
      renderCell: (params) =>
        params.row.pdf_url ? (
          <a
            href={`https://localhost:4000${params.row.pdf_url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "red" }}
          >
            <DescriptionIcon />
          </a>
        ) : (

          <InsertDriveFileIcon style={{ color: "grey" }} />
        ),
    }
  ];

  return (
    <DataGrid
      checkboxSelection
      rows={rows}
      columns={columns}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      initialState={{
        pagination: { paginationModel: { pageSize: 20 } },
      }}
      pageSizeOptions={[10, 20, 50]}
      disableColumnResize
      density="compact"
      slotProps={{
        filterPanel: {
          filterFormProps: {
            logicOperatorInputProps: {
              variant: 'outlined',
              size: 'small',
            },
            columnInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            operatorInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            valueInputProps: {
              InputComponentProps: {
                variant: 'outlined',
                size: 'small',
              },
            },
          },
        },
      }}
    />
  );
}
