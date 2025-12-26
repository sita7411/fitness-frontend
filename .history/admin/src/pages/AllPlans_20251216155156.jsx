// src/pages/AllNutritionPlans.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Edit, Trash2, Eye, X, ChevronDown, Plus, Trash2 as TrashSmall } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ITEMS_PER_PAGE = 6;

const StatusToggle = ({ status, onToggle }) => {
    const isActive = status?.toLowerCase() === "active";
    return (
        <button
            onClick={onToggle}
            className={`relative inline-flex items-center h-7 w-14 rounded-full transition ${isActive ? "bg-green-500" : "bg-gray-300"
                }`}
        >
            <span
                className={`absolute w-6 h-6 bg-white rounded-full shadow transform transition ${isActive ? "translate-x-7" : "translate-x-1"
                    }`}
            ></span>
        </button>
    );
};

const normalizeMeal = () => ({
    _id: Date.now() + Math.random(),
    type: "breakfast",
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    tools: [],
    notes: [],
    thumbnail: null,
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, cholesterol: 0, sodium: 0 },
});

export default function AllNutritionPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [dropdown, setDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [editPlan, setEditPlan] = useState(null);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/nutrition/");
            setPlans(res.data.map(p => ({
                ...p,
                coverImage: p.coverImage?.url || "https://via.placeholder.com/150"
            })));
        } catch (err) {
            toast.error("Failed to load plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const filteredPlans = useMemo(() => {
        return plans.filter(p => {
            const match = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.subtitle || "").toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = filterStatus === "All" || p.status === filterStatus;
            return match && statusMatch;
        });
    }, [plans, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredPlans.length / ITEMS_PER_PAGE);
    const paginated = filteredPlans.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const openModal = async (type, plan = null) => {
        setModalType(type);
        setSelectedPlan(plan);

        if (type === "add") {
            setEditPlan({
                title: "",
                subtitle: "",
                description: "",
                level: "Beginner",
                price: 0,
                coverImage: null,
                days: [{ _id: Date.now(), title: "Day 1", meals: [] }],
                status: "Active",
                plans: []
            });
        } else if (type === "edit" && plan) {
            setEditPlan({
                ...plan,
                coverImage: plan.coverImage ? { ...plan.coverImage } : null,

                days: plan.days.map(day => ({
                    ...day,
                    _id: day._id || Date.now(),
                    meals: day.meals.map(meal => ({
                        ...meal,
                        _id: meal._id || Date.now(),
                        thumbnail: meal.thumbnail ? { ...meal.thumbnail } : null
                    }))
                }))
            });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalType("");
        setSelectedPlan(null);
        setEditPlan(null);
    };

    const savePlan = async () => {
        if (!editPlan) return;

        const formData = new FormData();
        const cleanData = {
            ...editPlan,
            coverImage: editPlan.coverImage?.url
                ? {
                    url: editPlan.coverImage.url,
                    fileName: editPlan.coverImage.fileName || null,
                }
                : null,

            days: editPlan.days.map(d => ({
                title: d.title,
                meals: d.meals.map(m => ({
                    _id: m._id,
                    type: m.type,
                    title: m.title,
                    description: m.description,
                    ingredients: m.ingredients || [],
                    instructions: m.instructions || [],
                    tools: m.tools || [],
                    notes: m.notes || [],
                    nutrition: m.nutrition || {},

                    thumbnail: m.thumbnail?.url
                        ? {
                            url: m.thumbnail.url,
                            fileName: m.thumbnail.fileName || null,
                        }
                        : null,
                })),
            })),
        };
        formData.append("plan", JSON.stringify(cleanData));

        // cover image
        if (editPlan.coverImage?.file) {
            formData.append("coverImage", editPlan.coverImage.file);
        }

        // meal thumbnails
        editPlan.days.forEach((day, dIdx) => {
            day.meals.forEach((meal, mIdx) => {
                if (meal.thumbnail?.file) {
                    formData.append(`meal-${dIdx}-${mIdx}`, meal.thumbnail.file);
                }
            });
        });

        try {
            if (modalType === "add") {
                await axios.post("http://localhost:5000/api/nutrition", formData);
                toast.success("Plan created!");
            } else {
                await axios.put(`http://localhost:5000/api/nutrition/${editPlan._id}`, formData);
                toast.success("Plan updated!");
            }
            fetchPlans();
            closeModal();
        } catch (err) {
            toast.error("Save failed");
        }
    };

    const toggleStatus = async (id) => {
        const newStatus = plans.find(p => p._id === id).status === "Active"
            ? "Inactive"
            : "Active";

        await axios.patch(`http://localhost:5000/api/nutrition/${id}/status`, { status: newStatus });

        setPlans(prev => prev.map(p => p._id === id ? { ...p, status: newStatus } : p));
    };


    const deletePlan = async (id) => {
        if (!window.confirm("Delete permanently?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/nutrition/${id}`);
            setPlans(prev => prev.filter(p => p._id !== id));
            toast.success("Deleted!");
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    if (loading) return <div className="p-10 text-center text-xl">Loading...</div>;
    const TextListField = ({ label, value = [], onChange }) => {
        const updateItem = (idx, val) => {
            const list = [...value];
            list[idx] = val;
            onChange(list);
        };

        const addItem = () => onChange([...value, ""]);
        const deleteItem = idx => onChange(value.filter((_, i) => i !== idx));

        return (
            <div>
                <label className="font-semibold mb-2 block">{label}</label>
                {value.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                        <input
                            value={item}
                            onChange={e => updateItem(idx, e.target.value)}
                            className="flex-1 p-2 border rounded-lg"
                        />
                        <button onClick={() => deleteItem(idx)} className="text-red-500">
                            <TrashSmall size={18} />
                        </button>
                    </div>
                ))}
                <button className="text-red-600 text-sm" onClick={addItem}>
                    + Add {label}
                </button>
            </div>
        );
    };

    return (
        <div className="p-6 bg-white rounded-lg min-h-screen">
            <ToastContainer theme="dark" />

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold">All Nutrition Plans</h1>
                    <p className="text-gray-600">Manage your nutrition plans</p>
                </div>
                <button onClick={() => openModal("add")} className="flex items-center gap-2 bg-[#e3002a] hover:bg-[#c90024] text-white px-6 py-3 rounded-xl">
                    <Plus size={18} /> Add Plan
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                    type="text" placeholder="Search plans..." value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="flex-1 px-5 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                />
                <div className="relative">
                    <button onClick={() => setDropdown(!dropdown)} className="px-6 py-3 border rounded-xl bg-white flex items-center gap-2">
                        {filterStatus} <ChevronDown />
                    </button>
                    {dropdown && (
                        <div className="absolute top-full mt-2 w-full bg-white border rounded-xl shadow-lg z-10">
                            {["All", "Active", "Inactive"].map(s => (
                                <button key={s} onClick={() => { setFilterStatus(s); setDropdown(false); setCurrentPage(1); }}
                                    className="block w-full text-left px-4 py-3 hover:bg-gray-100">{s}</button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-[#e3002a] text-white">
                        <tr>
                            <th className="px-6 py-5 text-left">Plan</th>
                            <th className="px-6 py-5 text-left">Level</th>
                            <th className="px-6 py-5 text-left">Price</th>
                            <th className="px-6 py-5 text-left">Days</th>
                            <th className="px-6 py-5 text-left">Status</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map(p => (
                            <tr key={p._id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-5 flex items-center gap-4">
                                    <img src={p.coverImage} alt="" className="w-14 h-14 rounded-xl object-cover" />
                                    <div>
                                        <p className="font-semibold">{p.title}</p>
                                        <p className="text-xs text-gray-500">{p.subtitle || "No subtitle"}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5"><span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">{p.level}</span></td>
                                <td className="px-6 py-5 font-bold">{p.isFree ? "Free" : `₹${p.price}`}</td>
                                <td className="px-6 py-5">{p.days?.length || 0} days</td>
                                <td className="px-6 py-5"><StatusToggle status={p.status} onToggle={() => toggleStatus(p._id)} /></td>
                                <td className="px-6 py-5 text-right space-x-3">
                                    <button onClick={() => openModal("view", p)}><Eye size={18} className="text-gray-600" /></button>
                                    <button onClick={() => openModal("edit", p)}><Edit size={18} className="text-blue-600" /></button>
                                    <button onClick={() => deletePlan(p._id)}><Trash2 size={18} className="text-red-600" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Full Edit/Add Modal - Same as AllClasses */}
            {(modalType === "edit" || modalType === "add") && editPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">

                        {/* HEADER */}
                        <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center">
                            <h2 className="text-3xl font-bold text-gray-800">
                                {modalType === "add" ? "Create" : "Edit"} Nutrition Plan
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-8 space-y-10">

                            {/* ---------- BASIC INFO ----------- */}
                            <section className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-700">Basic Details</h3>

                                <input
                                    value={editPlan.title}
                                    onChange={e => setEditPlan({ ...editPlan, title: e.target.value })}
                                    placeholder="Title"
                                    className="w-full text-3xl font-bold border-b-2 border-gray-300 pb-2 outline-none focus:border-red-500"
                                />

                                <input
                                    value={editPlan.subtitle}
                                    onChange={e => setEditPlan({ ...editPlan, subtitle: e.target.value })}
                                    placeholder="Subtitle"
                                    className="w-full text-lg border-b pb-2 outline-none"
                                />

                                <textarea
                                    value={editPlan.description}
                                    onChange={e => setEditPlan({ ...editPlan, description: e.target.value })}
                                    placeholder="Description"
                                    className="w-full p-4 border rounded-xl h-28"
                                />
                            </section>

                            {/* ---------- COVER IMAGE ----------- */}
                            <section className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-700">Cover Image</h3>

                                {editPlan.coverImage?.url && (
                                    <img
                                        src={editPlan.coverImage.url}
                                        className="w-96 h-56 rounded-xl object-cover shadow"
                                        alt="Cover preview"
                                    />
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e =>
                                        setEditPlan({
                                            ...editPlan,
                                            coverImage: {
                                                file: e.target.files[0],
                                                url: URL.createObjectURL(e.target.files[0])
                                            }
                                        })
                                    }
                                />
                            </section>

                            {/* ---------- PLAN SETTINGS ----------- */}
                            <section className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-700">Plan Settings</h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                                    <select
                                        value={editPlan.level}
                                        onChange={e => setEditPlan({ ...editPlan, level: e.target.value })}
                                        className="p-3 border rounded-xl"
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>

                                    <input
                                        type="number"
                                        value={editPlan.price}
                                        onChange={e => setEditPlan({ ...editPlan, price: +e.target.value })}
                                        disabled={editPlan.isFree}
                                        placeholder="Price"
                                        className="p-3 border rounded-xl"
                                    />



                                    <div className="flex items-center gap-4 mt-4">
                                        {["Basic", "Pro", "Premium"].map((p) => {
                                            const isSelected = editPlan.plans.includes(p);

                                            return (
                                                <div
                                                    key={p}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition
                                                        ${isSelected
                                                            ? "border-[#e3002a] bg-[#e3002a]/10"
                                                            : "border-gray-300 hover:border-[#e3002a]"
                                                        }`}
                                                    onClick={() => {
                                                        const updatedPlans = isSelected
                                                            ? editPlan.plans.filter((x) => x !== p)
                                                            : [...editPlan.plans, p];

                                                        setEditPlan({ ...editPlan, plans: updatedPlans });
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        readOnly
                                                        className="h-4 w-4 accent-[#e3002a]"
                                                    />
                                                    <span className={`text-sm font-medium ${isSelected ? "text-[#e3002a]" : "text-gray-700"}`}>
                                                        {p}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>

                            {/* -------- DAYS & MEALS SECTION -------- */}
                            <section className="space-y-8">
                                <h3 className="text-xl font-bold text-gray-700">Days & Meals</h3>

                                {editPlan.days.map((day, dayIdx) => (
                                    <div key={day._id} className="border rounded-2xl p-6 bg-gray-50">

                                        <input
                                            value={day.title}
                                            onChange={e => {
                                                const newDays = [...editPlan.days];
                                                newDays[dayIdx].title = e.target.value;
                                                setEditPlan({ ...editPlan, days: newDays });
                                            }}
                                            className="text-2xl font-bold w-full bg-transparent border-b pb-2 outline-none"
                                            placeholder="Day Title"
                                        />

                                        {/* MEALS */}
                                        {day.meals.map((meal, mealIdx) => (
                                            <div
                                                key={meal._id}
                                                className="bg-white rounded-xl p-5 mt-4 border shadow-sm space-y-5"
                                            >
                                                {/* Meal Header Row */}
                                                <div className="flex justify-between items-center">
                                                    <select
                                                        value={meal.type}
                                                        onChange={e => {
                                                            const newDays = [...editPlan.days];
                                                            newDays[dayIdx].meals[mealIdx].type = e.target.value;
                                                            setEditPlan({ ...editPlan, days: newDays });
                                                        }}
                                                        className="px-4 py-2 border rounded-lg"
                                                    >
                                                        <option value="breakfast">Breakfast</option>
                                                        <option value="lunch">Lunch</option>
                                                        <option value="dinner">Dinner</option>
                                                        <option value="snack">Snack</option>
                                                    </select>

                                                    <button
                                                        onClick={() =>
                                                            setEditPlan(prev => ({
                                                                ...prev,
                                                                days: prev.days.map((d, i) =>
                                                                    i === dayIdx
                                                                        ? { ...d, meals: d.meals.filter((_, j) => j !== mealIdx) }
                                                                        : d
                                                                )
                                                            }))
                                                        }
                                                        className="text-red-600"
                                                    >
                                                        <TrashSmall size={20} />
                                                    </button>
                                                </div>

                                                {/* Thumbnail */}
                                                <div className="flex gap-6">
                                                    <div className="w-40 h-32 bg-gray-200 rounded-xl border-2 border-dashed overflow-hidden">
                                                        {meal.thumbnail?.url && (
                                                            <img src={meal.thumbnail.url} className="w-full h-full object-cover" />
                                                        )}
                                                    </div>

                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={e => {
                                                            const newDays = [...editPlan.days];
                                                            newDays[dayIdx].meals[mealIdx].thumbnail = {
                                                                file: e.target.files[0],
                                                                url: URL.createObjectURL(e.target.files[0])
                                                            };
                                                            setEditPlan({ ...editPlan, days: newDays });
                                                        }}
                                                    />
                                                </div>

                                                {/* Meal Title */}
                                                <input
                                                    value={meal.title}
                                                    onChange={e => {
                                                        const newDays = [...editPlan.days];
                                                        newDays[dayIdx].meals[mealIdx].title = e.target.value;
                                                        setEditPlan({ ...editPlan, days: newDays });
                                                    }}
                                                    placeholder="Meal Title"
                                                    className="w-full p-2 border rounded-lg"
                                                />

                                                {/* Description */}
                                                <textarea
                                                    value={meal.description}
                                                    onChange={e => {
                                                        const newDays = [...editPlan.days];
                                                        newDays[dayIdx].meals[mealIdx].description = e.target.value;
                                                        setEditPlan({ ...editPlan, days: newDays });
                                                    }}
                                                    placeholder="Meal Description"
                                                    className="w-full p-3 border rounded-lg"
                                                />

                                                {/* Ingredients */}
                                                <TextListField
                                                    label="Ingredients"
                                                    value={meal.ingredients}
                                                    onChange={list => {
                                                        const newDays = [...editPlan.days];
                                                        newDays[dayIdx].meals[mealIdx].ingredients = list;
                                                        setEditPlan({ ...editPlan, days: newDays });
                                                    }}
                                                />

                                                {/* Instructions */}
                                                <TextListField
                                                    label="Instructions"
                                                    value={meal.instructions}
                                                    onChange={list => {
                                                        const newDays = [...editPlan.days];
                                                        newDays[dayIdx].meals[mealIdx].instructions = list;
                                                        setEditPlan({ ...editPlan, days: newDays });
                                                    }}
                                                />

                                                {/* Tools */}
                                                <TextListField
                                                    label="Tools"
                                                    value={meal.tools}
                                                    onChange={list => {
                                                        const newDays = [...editPlan.days];
                                                        newDays[dayIdx].meals[mealIdx].tools = list;
                                                        setEditPlan({ ...editPlan, days: newDays });
                                                    }}
                                                />

                                                {/* Notes */}
                                                <TextListField
                                                    label="Notes"
                                                    value={meal.notes}
                                                    onChange={list => {
                                                        const newDays = [...editPlan.days];
                                                        newDays[dayIdx].meals[mealIdx].notes = list;
                                                        setEditPlan({ ...editPlan, days: newDays });
                                                    }}
                                                />

                                                {/* Nutrition --------------------- */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    {Object.keys(meal.nutrition).map(key => (
                                                        <div key={key} className="flex flex-col">
                                                            <label className="text-sm text-gray-500 capitalize">{key}</label>
                                                            <input
                                                                type="number"
                                                                value={meal.nutrition[key]}
                                                                onChange={e => {
                                                                    const newDays = [...editPlan.days];
                                                                    newDays[dayIdx].meals[mealIdx].nutrition[key] =
                                                                        Number(e.target.value);
                                                                    setEditPlan({ ...editPlan, days: newDays });
                                                                }}
                                                                className="p-2 border rounded-lg"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() =>
                                                setEditPlan(prev => ({
                                                    ...prev,
                                                    days: prev.days.map((d, i) =>
                                                        i === dayIdx
                                                            ? { ...d, meals: [...d.meals, normalizeMeal()] }
                                                            : d
                                                    )
                                                }))
                                            }
                                            className="mt-4 text-red-600 font-semibold flex items-center gap-2"
                                        >
                                            <Plus size={18} /> Add Meal
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={() =>
                                        setEditPlan(prev => ({
                                            ...prev,
                                            days: [...prev.days, { _id: Date.now(), title: `Day ${prev.days.length + 1}`, meals: [] }]
                                        }))
                                    }
                                    className="px-6 py-3 border rounded-xl flex items-center gap-2"
                                >
                                    <Plus size={18} /> Add Day
                                </button>
                            </section>

                            {/* SAVE BUTTON */}
                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={savePlan}
                                    className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                                >
                                    {modalType === "add" ? "Create Plan" : "Save Changes"}
                                </button>
                            </div>

                        </div>

                    </div>
                </div>
            )}


            {/* View Modal */}
            {modalType === "view" && selectedPlan && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between mb-6">
                            <h2 className="text-3xl font-bold">{selectedPlan.title}</h2>
                            <button onClick={closeModal}><X size={24} /></button>
                        </div>
                        <img src={selectedPlan.coverImage} className="w-full h-72 object-cover rounded-xl mb-6" alt="" />
                        <p className="text-xl text-gray-600 mb-4">{selectedPlan.subtitle}</p>
                        <p className="text-gray-700 mb-8">{selectedPlan.description}</p>
                        <div className="grid grid-cols-4 gap-6">
                            <div className="bg-blue-50 p-6 rounded-2xl text-center"><p className="text-2xl font-bold">₹{selectedPlan.price}</p><p>Price</p></div>
                            <div className="bg-green-50 p-6 rounded-2xl text-center"><p className="text-2xl font-bold">{selectedPlan.level}</p><p>Level</p></div>
                            <div className="bg-purple-50 p-6 rounded-2xl text-center"><p className="text-2xl font-bold">{selectedPlan.days?.length || 0}</p><p>Days</p></div>
                            <div className="bg-orange-50 p-6 rounded-2xl text-center"><p className="text-2xl font-bold">{selectedPlan.status}</p><p>Status</p></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}