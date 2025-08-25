interface CustomerContainerProps {
  children: React.ReactNode
  customerId?: string
}

export default function CustomerContainer({ children, customerId }: CustomerContainerProps) {
  return (
    <div className="customer-container" data-customer-id={customerId}>
      {children}
    </div>
  )
}