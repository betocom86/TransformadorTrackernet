using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProsecuAPI.Models;

public class SafetyEquipment
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int PersonnelId { get; set; }

    [Required]
    [StringLength(100)]
    public string EquipmentType { get; set; } = string.Empty;

    [StringLength(50)]
    public string? Brand { get; set; }

    [StringLength(50)]
    public string? Model { get; set; }

    [StringLength(50)]
    public string? SerialNumber { get; set; }

    [DataType(DataType.Date)]
    public DateTime? PurchaseDate { get; set; }

    [DataType(DataType.Date)]
    public DateTime? LastInspection { get; set; }

    [DataType(DataType.Date)]
    public DateTime? NextInspection { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "active";

    [StringLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("PersonnelId")]
    public virtual Personnel Personnel { get; set; } = null!;
}

public class Training
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int PersonnelId { get; set; }

    [Required]
    [StringLength(100)]
    public string TrainingName { get; set; } = string.Empty;

    [StringLength(50)]
    public string? TrainingType { get; set; }

    [StringLength(100)]
    public string? Provider { get; set; }

    [DataType(DataType.Date)]
    public DateTime? CompletionDate { get; set; }

    [DataType(DataType.Date)]
    public DateTime? ExpiryDate { get; set; }

    [StringLength(50)]
    public string? CertificateNumber { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "valid";

    [StringLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("PersonnelId")]
    public virtual Personnel Personnel { get; set; } = null!;
}

public class Alert
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(255)]
    public string Message { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string AlertType { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Priority { get; set; } = "medium";

    public int? PersonnelId { get; set; }

    public int? DocumentId { get; set; }

    public int? TrainingId { get; set; }

    public int? SafetyEquipmentId { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "active";

    [DataType(DataType.DateTime)]
    public DateTime? ResolvedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("PersonnelId")]
    public virtual Personnel? Personnel { get; set; }

    [ForeignKey("DocumentId")]
    public virtual Document? Document { get; set; }

    [ForeignKey("TrainingId")]
    public virtual Training? Training { get; set; }

    [ForeignKey("SafetyEquipmentId")]
    public virtual SafetyEquipment? SafetyEquipment { get; set; }
}

public class Transformer
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string SerialNumber { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Manufacturer { get; set; }

    [StringLength(50)]
    public string? Model { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? Capacity { get; set; }

    [StringLength(20)]
    public string? Voltage { get; set; }

    [StringLength(255)]
    public string? Location { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "active";

    [DataType(DataType.Date)]
    public DateTime? InstallationDate { get; set; }

    [DataType(DataType.Date)]
    public DateTime? LastMaintenance { get; set; }

    [DataType(DataType.Date)]
    public DateTime? NextMaintenance { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<WorkOrderTransformer> WorkOrders { get; set; } = new List<WorkOrderTransformer>();
}

public class WorkOrderTransformer
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkOrderId { get; set; }

    [Required]
    public int TransformerId { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("WorkOrderId")]
    public virtual WorkOrder WorkOrder { get; set; } = null!;

    [ForeignKey("TransformerId")]
    public virtual Transformer Transformer { get; set; } = null!;

    public virtual ICollection<TransformerProcedure> Procedures { get; set; } = new List<TransformerProcedure>();
}

public class ProcedureCatalog
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string ProcedureName { get; set; } = string.Empty;

    [StringLength(50)]
    public string? Category { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(5000)]
    public string? Instructions { get; set; }

    [StringLength(1000)]
    public string? SafetyRequirements { get; set; }

    [StringLength(1000)]
    public string? ToolsRequired { get; set; }

    public int? EstimatedTime { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<TransformerProcedure> TransformerProcedures { get; set; } = new List<TransformerProcedure>();
}

public class TransformerProcedure
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkOrderId { get; set; }

    [Required]
    public int TransformerId { get; set; }

    [Required]
    public int ProcedureId { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "pending";

    [DataType(DataType.DateTime)]
    public DateTime? StartedAt { get; set; }

    [DataType(DataType.DateTime)]
    public DateTime? CompletedAt { get; set; }

    public int? PerformedBy { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("WorkOrderId")]
    public virtual WorkOrder WorkOrder { get; set; } = null!;

    [ForeignKey("TransformerId")]
    public virtual Transformer Transformer { get; set; } = null!;

    [ForeignKey("ProcedureId")]
    public virtual ProcedureCatalog Procedure { get; set; } = null!;

    [ForeignKey("PerformedBy")]
    public virtual Personnel? PerformedByPersonnel { get; set; }

    public virtual ICollection<TransformerProcedurePhoto> Photos { get; set; } = new List<TransformerProcedurePhoto>();
}

public class TransformerProcedurePhoto
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ProcedureId { get; set; }

    [Required]
    [StringLength(255)]
    public string PhotoPath { get; set; } = string.Empty;

    [StringLength(255)]
    public string? Description { get; set; }

    [StringLength(255)]
    public string? WatermarkedPath { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("ProcedureId")]
    public virtual TransformerProcedure Procedure { get; set; } = null!;
}