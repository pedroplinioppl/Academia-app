import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function ExercicioCard({ exercicio, editando, onClick }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: exercicio.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div 
            ref={setNodeRef}
            style={style}
            className="exercicio-card clicavel"
            onClick={onClick}
        >
            {editando && (
                <span className="drag-handle" {...attributes} {...listeners}>⠿</span>
            )}
            <span className="exercicio-nome">{exercicio.exercicio.nome}</span>
            <span className="exercicio-series">
                {exercicio.series}×{exercicio.repeticoes} • {exercicio.peso} kg
            </span>
        </div>
    );
}

export default ExercicioCard;