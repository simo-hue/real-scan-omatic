export const GridBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-screen filter blur-3xl animate-float opacity-70" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-accent-purple/30 rounded-full mix-blend-screen filter blur-3xl animate-float opacity-70" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-cyan/20 rounded-full mix-blend-screen filter blur-3xl animate-float opacity-70" style={{ animationDelay: '4s' }} />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(217 91% 60% / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(217 91% 60% / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/50 to-background" />
    </div>
  );
};
