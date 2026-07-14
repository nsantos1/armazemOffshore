"use client";

// Wrapper de ícones (lucide-react) + marca. `Icon` recebe o nome como string porque
// os nomes vêm de dados dinâmicos (settings.pillars[].icon, banners, etc.) — por
// isso o mapa cobre todos os nomes usados em qualquer lugar do app; nomes não
// mapeados caem no fallback `Circle`.
import * as React from "react";
import {
  AlertCircle,
  Anchor,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Bold,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Circle,
  Code,
  Contact as ContactIcon,
  Cog,
  Copy,
  Download,
  Droplet,
  ExternalLink,
  Eye,
  EyeOff,
  Facebook,
  FileCheck2,
  FilePen,
  Flame,
  Globe,
  Globe2,
  HardHat,
  Heading1,
  Heading2,
  History,
  Image,
  Inbox,
  Info,
  Instagram,
  Italic,
  LayoutDashboard,
  LineChart,
  Link,
  Linkedin,
  List,
  ListOrdered,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MailCheck,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  MessageSquare,
  Monitor,
  Navigation,
  Newspaper,
  Paintbrush,
  Palette,
  Pencil,
  Phone,
  Plus,
  Quote,
  Redo,
  Save,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Tag,
  Trash2,
  Truck,
  Type,
  Underline,
  Undo,
  Upload,
  UploadCloud,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { ElementType } from "react";

const IconMap: Record<string, ElementType> = {
  AlertCircle, Anchor, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight,
  BadgeCheck, Bell, Bold, Building2, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Code, Contact: ContactIcon, Cog, Copy, Download,
  Droplet, ExternalLink, Eye, EyeOff, Facebook, FileCheck2, FilePen, Flame, Globe,
  Globe2, HardHat, Heading1, Heading2, History, Image, Inbox, Info, Instagram,
  Italic, LayoutDashboard, LineChart, Link, Linkedin, List, ListOrdered, Loader2,
  Lock, LogIn, LogOut, Mail, MailCheck, MapPin, Megaphone, Menu, MessageCircle,
  MessageSquare, Monitor, Navigation, Newspaper, Paintbrush, Palette, Pencil, Phone,
  Plus, Quote, Redo, Save, Search, Send, Settings, Share2, ShieldCheck, ShoppingBag,
  Smartphone, Tag, Trash2, Truck, Type, Underline, Undo, Upload, UploadCloud,
  UserCheck, UserPlus, UserX, Users, Wrench, X, Zap,
  "wa-icon": FaWhatsapp, WhatsApp: FaWhatsapp, Whatsapp: FaWhatsapp, whatsapp: FaWhatsapp,
};

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: string;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, className = "w-5 h-5", strokeWidth = 2, ...rest }: IconProps) {
  const C = IconMap[name] || Circle;
  return <C className={className} strokeWidth={strokeWidth} aria-hidden="true" {...rest} />;
}

export function LogoMark({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <img
      src="/assets/armazem_offshore_logo.png"
      alt="Armazém Offshore"
      className={`${className} object-contain`}
    />
  );
}

export function LogoLockup({ className = "" }: { className?: string }) {
  return <LogoMark className={`h-10 w-auto ${className}`} />;
}

export function LogoIcon({ className = "w-9 h-9" }: { className?: string }) {
  return <img src="/assets/logo-icon.png" alt="Armazém Offshore" className={`${className} object-contain`} />;
}
