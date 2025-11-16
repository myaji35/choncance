import { useToast } from "@/components/ui/use-toast";

export function useToastEnhanced() {
  const { toast } = useToast();

  return {
    success: (message: string, description?: string) => {
      toast({
        title: "✅ " + message,
        description,
        className: "bg-green-50 border-green-200",
      });
    },
    error: (message: string, description?: string) => {
      toast({
        title: "❌ " + message,
        description,
        variant: "destructive",
      });
    },
    info: (message: string, description?: string) => {
      toast({
        title: "ℹ️ " + message,
        description,
        className: "bg-blue-50 border-blue-200",
      });
    },
    warning: (message: string, description?: string) => {
      toast({
        title: "⚠️ " + message,
        description,
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    booking: (propertyName: string) => {
      toast({
        title: "🎉 예약이 완료되었습니다!",
        description: `${propertyName}에서의 멋진 시간을 기대해주세요.`,
        className: "bg-primary/5 border-primary/20",
      });
    },
    wishlist: {
      add: (propertyName: string) => {
        toast({
          title: "❤️ 찜 목록에 추가되었습니다",
          description: `${propertyName}을(를) 찜했습니다.`,
          className: "bg-red-50 border-red-200",
        });
      },
      remove: (propertyName: string) => {
        toast({
          title: "💔 찜 목록에서 제거되었습니다",
          description: `${propertyName}을(를) 찜 해제했습니다.`,
        });
      },
    },
  };
}
