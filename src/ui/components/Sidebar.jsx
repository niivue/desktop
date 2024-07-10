import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";

export function Sidebar({ children, asColumn = true, ...props }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: asColumn ? "column" : "row",
        alignItems: "flex-start",
        height: "100%",
        minHeight: "100%",
        minWidth: Math.round(window.screen.width * 0.3), // calculate 20% of the window width
        maxWidth: Math.round(window.screen.width * 0.3), // calculate 30% of the window width
        backgroundColor: "white",
        padding: 1,
        overflowY: "scroll",
        overflowX: "hidden",
        gap: 1,
        ...props,
      }}
    >
      {children}
    </Box>
  );
}

Sidebar.propTypes = {
  children: PropTypes.node,
  asColumn: PropTypes.bool,
};
