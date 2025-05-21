import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  name: string;
  price: string;
  description: string;
  imageUrl: string;
}

export function ProductCard({
  name,
  price,
  description,
  imageUrl,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden border-[#4872cc]/10 shadow-sm rounded-xl">
      <div className="aspect-video relative">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader className="p-3">
        <CardTitle className="text-base font-medium">{name}</CardTitle>
        <CardDescription className="text-sm font-medium text-[#4872cc]">
          {price}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full text-xs border-[#4872cc] text-[#4872cc] hover:bg-[#4872cc]/10"
        >
          詳細を見る
        </Button>
        <Button
          size="sm"
          className="rounded-full text-xs bg-[#4872cc] hover:bg-[#4872cc]/90"
        >
          購入する
          <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
