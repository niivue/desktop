import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";

export function Sidebar({ children, asColumn = true, ...props }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: asColumn ? 'column' : 'row',
        alignItems: 'flex-start',
        height: '100%',
        minHeight: '100%',
        minWidth: '30%',
        backgroundColor: 'white',
        padding: '8px',
        overflowY: 'scroll',
        overflowX: 'hidden',
        gap: '8px',
        ...props
      }}
    >
      <Typography
        variant="body"
        sx={{
          marginTop: '10px',
          marginBottom: '10px',
          marginLeft: '8px',
        }}
      >
        Images
      </Typography>
      {children}
    </div>
  );
}

Sidebar.propTypes = {
  children: PropTypes.node,
  asColumn: PropTypes.bool,
}