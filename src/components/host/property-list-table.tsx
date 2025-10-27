"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Property {
  id: string;
  name: string;
  address: string;
  pricePerNight: any;
  status: string;
  thumbnailUrl: string | null;
  images: string[];
  _count?: {
    bookings: number;
  };
}

interface PropertyListTableProps {
  properties: Property[];
}

export function PropertyListTable({ properties }: PropertyListTableProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">아직 등록된 숙소가 없습니다</p>
        <Link href="/host/properties/new">
          <Button>첫 숙소 등록하기</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="default" className="bg-green-600">승인됨</Badge>;
      case "PENDING":
        return <Badge variant="secondary">검토 중</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">거부됨</Badge>;
      case "INACTIVE":
        return <Badge variant="outline">비활성</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>숙소</TableHead>
          <TableHead>주소</TableHead>
          <TableHead>가격/박</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow key={property.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-md overflow-hidden">
                  <Image
                    src={property.thumbnailUrl || property.images[0] || "/placeholder.jpg"}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{property.name}</div>
                  {property._count && (
                    <div className="text-sm text-gray-500">
                      예약 {property._count.bookings}건
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {property.address}
            </TableCell>
            <TableCell className="font-medium">
              ₩{Number(property.pricePerNight).toLocaleString()}
            </TableCell>
            <TableCell>{getStatusBadge(property.status)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Link href={`/property/${property.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/host/properties/${property.id}/edit`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
