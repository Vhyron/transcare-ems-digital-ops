const Loading = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default Loading;
