import ColorLab from '@/components/admin/ColorLab';

export default function LabPage() {
    return (
        <div className="h-full overflow-hidden">
            <div className="px-8 pt-8">
                <h1 className="text-3xl font-black text-zinc-100 tracking-tight">Laboratorio de Color</h1>
                <p className="text-zinc-500 mt-2">Experimenta con paletas y contrastes en tiempo real.</p>
            </div>
            <ColorLab />
        </div>
    );
}
