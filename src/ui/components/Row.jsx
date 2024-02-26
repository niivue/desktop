export function Row({ children, ...props }){
    return (
        <div
        style={{
            display: 'flex',
            flexDirection: 'row',
            minWidth: '50px',
            minHeight: '50px',
            ...props
        }}
        >
        {children}
        </div>
    )
}