import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
  format: RegExp;
}

const COUNTRIES: Country[] = [
  {
    code: "MX",
    name: "México",
    dialCode: "+52",
    flag: "🇲🇽",
    placeholder: "123 456 7890",
    format: /^[\d\s]{10,13}$/,
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    placeholder: "(123) 456-7890",
    format: /^[\d\s\(\)\-]{10,14}$/,
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "🇨🇦",
    placeholder: "(123) 456-7890",
    format: /^[\d\s\(\)\-]{10,14}$/,
  },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export function PhoneInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  className,
  id,
  name,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      // Clear the phone number when country changes
      onChange("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove any non-digit characters for validation
    const digitsOnly = input.replace(/\D/g, "");

    // Allow users to type freely but store the formatted version
    onChange(input);
  };

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return "";

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");

    // Format based on country
    if (selectedCountry.code === "MX") {
      // Format: XXX XXX XXXX
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    } else {
      // Format for US/CA: (XXX) XXX-XXXX
      if (digits.length <= 3) return digits;
      if (digits.length <= 6)
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  // Get the full phone number with country code
  const getFullPhoneNumber = () => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return `${selectedCountry.dialCode}${digits}`;
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Select
        value={selectedCountry.code}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn("w-[140px] h-12", error && "border-red-500")}
        >
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">
                {selectedCountry.dialCode}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{country.flag}</span>
                <span className="text-sm">{country.name}</span>
                <span className="text-sm text-muted-foreground">
                  {country.dialCode}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1 relative">
        <Input
          id={id}
          name={name}
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          onBlur={onBlur}
          placeholder={selectedCountry.placeholder}
          disabled={disabled}
          className={cn(
            "h-12 text-base",
            error && "border-red-500 focus-visible:ring-red-500",
          )}
          autoComplete="tel"
        />
      </div>
    </div>
  );
}

export { COUNTRIES };
export type { Country };
