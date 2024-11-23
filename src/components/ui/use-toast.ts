// This is a placeholder for the actual toast component
// The real implementation is in the hidden files
export const useToast = () => ({
  toast: ({ title, description, variant }: any) => {
    console.log('Toast:', { title, description, variant });
  }
});