export interface VoiceCommand {
  command: string
  action: () => void
  description: string
}

export interface VoiceControlConfig {
  enabled: boolean
  language: string
  commands: VoiceCommand[]
  continuous: boolean
}

export const DEFAULT_VOICE_COMMANDS: VoiceCommand[] = [
  {
    command: 'navigate next',
    action: () => dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })),
    description: 'Move to next data point'
  },
  {
    command: 'navigate previous',
    action: () => dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })),
    description: 'Move to previous data point'
  },
  {
    command: 'select',
    action: () => dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })),
    description: 'Select current item'
  }
]

export const handleVoiceCommands = (config: VoiceControlConfig = {
  enabled: true,
  language: 'en-US',
  commands: DEFAULT_VOICE_COMMANDS,
  continuous: false
}) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('Speech recognition not supported in this browser')
    return { start: () => {}, stop: () => {}, isSupported: false }
  }
  
  // @ts-ignore - SpeechRecognition types may not be available
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()
  
  recognition.continuous = config.continuous
  recognition.interimResults = false
  recognition.lang = config.language
  
  recognition.onresult = (event: any) => {
    const transcript = event.results[event.resultIndex][0].transcript.toLowerCase().trim()
    
    const matchedCommand = config.commands.find(cmd => 
      transcript.includes(cmd.command.toLowerCase())
    )
    
    if (matchedCommand) {
      matchedCommand.action()
    }
  }
  
  recognition.onerror = (event: any) => {
    console.warn('Voice recognition error:', event.error)
  }
  
  return {
    start: () => config.enabled && recognition.start(),
    stop: () => recognition.stop(),
    isSupported: true
  }
}

export const createVoiceCommand = (
  command: string,
  action: () => void,
  description: string = ''
): VoiceCommand => {
  return { command, action, description }
}

export default handleVoiceCommands