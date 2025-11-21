import { LinkProps, router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { cn } from "@/utils";

export default function Link(props: LinkProps) {
    const { children, href, className = '', ...rest } = props;
    return (
        <TouchableOpacity
            className={cn("mt-3 bg-primary-50 border border-primary-200 rounded-lg py-2 px-4 flex-row items-center justify-center gap-2", className)}
            onPress={(e) => {
                e.stopPropagation();
                router.push(href as any);
            }}
            activeOpacity={0.7}
            {...(rest as any)}
        >
            {children}
        </TouchableOpacity>
    )
}