
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface ContactEventButtonProps {
  contactId: string
  contactName: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function ContactEventButton({ 
  contactId, 
  contactName, 
  variant = 'outline',
  size = 'default',
  className = ''
}: ContactEventButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/events?contact=${contactId}`)
  }

  return (
    <Button 
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
    >
      <Calendar className="h-4 w-4 mr-2" />
      View Events
    </Button>
  )
}
