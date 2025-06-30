using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProsecuAPI.Models;

public class Crew
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string CrewName { get; set; } = string.Empty;

    [StringLength(50)]
    public string? CrewType { get; set; }

    [StringLength(255)]
    public string? Location { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "available";

    public int? SupervisorId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("SupervisorId")]
    public virtual Personnel? Supervisor { get; set; }
    
    public virtual ICollection<CrewMember> Members { get; set; } = new List<CrewMember>();
    public virtual ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
    public virtual ICollection<Route> Routes { get; set; } = new List<Route>();
}

public class CrewMember
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CrewId { get; set; }

    [Required]
    public int PersonnelId { get; set; }

    [StringLength(100)]
    public string? Role { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("CrewId")]
    public virtual Crew Crew { get; set; } = null!;

    [ForeignKey("PersonnelId")]
    public virtual Personnel Personnel { get; set; } = null!;
}

public class WorkOrder
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(20)]
    public string OrderNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string Priority { get; set; } = "medium";

    [StringLength(50)]
    public string Status { get; set; } = "pending";

    [StringLength(255)]
    public string? Location { get; set; }

    [StringLength(20)]
    public string? PostalCode { get; set; }

    [Column(TypeName = "decimal(10,7)")]
    public decimal? Latitude { get; set; }

    [Column(TypeName = "decimal(10,7)")]
    public decimal? Longitude { get; set; }

    public int? AssignedCrewId { get; set; }

    public int? RequestedById { get; set; }

    [DataType(DataType.DateTime)]
    public DateTime? ScheduledDate { get; set; }

    [DataType(DataType.DateTime)]
    public DateTime? CompletedDate { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("AssignedCrewId")]
    public virtual Crew? AssignedCrew { get; set; }

    [ForeignKey("RequestedById")]
    public virtual Personnel? RequestedBy { get; set; }

    public virtual ICollection<WorkOrderPhoto> Photos { get; set; } = new List<WorkOrderPhoto>();
    public virtual ICollection<WorkOrderStep> Steps { get; set; } = new List<WorkOrderStep>();
    public virtual ICollection<WorkOrderTransformer> Transformers { get; set; } = new List<WorkOrderTransformer>();
}

public class WorkOrderPhoto
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkOrderId { get; set; }

    [Required]
    [StringLength(255)]
    public string PhotoPath { get; set; } = string.Empty;

    [StringLength(255)]
    public string? Description { get; set; }

    [StringLength(255)]
    public string? WatermarkedPath { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("WorkOrderId")]
    public virtual WorkOrder WorkOrder { get; set; } = null!;
}

public class WorkOrderStep
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkOrderId { get; set; }

    [Required]
    public int StepNumber { get; set; }

    [Required]
    [StringLength(255)]
    public string StepName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "pending";

    public bool IsRequired { get; set; } = true;

    [DataType(DataType.DateTime)]
    public DateTime? CompletedAt { get; set; }

    public int? CompletedById { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [StringLength(1000)]
    public string? VerificationData { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("WorkOrderId")]
    public virtual WorkOrder WorkOrder { get; set; } = null!;

    [ForeignKey("CompletedById")]
    public virtual Personnel? CompletedBy { get; set; }
}

public class Route
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string RouteName { get; set; } = string.Empty;

    [Required]
    public int CrewId { get; set; }

    [DataType(DataType.Date)]
    public DateTime RouteDate { get; set; }

    [StringLength(255)]
    public string? StartLocation { get; set; }

    [StringLength(255)]
    public string? EndLocation { get; set; }

    [Column(TypeName = "decimal(8,2)")]
    public decimal? TotalDistance { get; set; }

    public int? EstimatedTime { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "planned";

    [StringLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("CrewId")]
    public virtual Crew Crew { get; set; } = null!;
}