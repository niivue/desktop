import PropTypes from 'prop-types';
export function FileList({ children, ...props }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '100%',
        width: '100%',
        minHeight: '40%',
        // very light gray
        backgroundColor: '#F8F8F8',
        // slight border radius
        borderRadius: '4px',
        ...props
      }}
    >
      {children}
    </div>
  )
}

FileList.propTypes = {
  children: PropTypes.node,
}