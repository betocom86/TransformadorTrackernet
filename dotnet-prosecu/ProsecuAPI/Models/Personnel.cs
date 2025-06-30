using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProsecuAPI.Models;

public class Personnel
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [StringLength(20)]
    public string? EmployeeId { get; set; }

    [StringLength(100)]
    public string? Position { get; set; }

    [StringLength(50)]
    public string? Department { get; set; }

    [DataType(DataType.Date)]
    public DateTime? HireDate { get; set; }

    [EmailAddress]
    [StringLength(255)]
    public string? Email { get; set; }

    [Phone]
    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(255)]
    public string? Address { get; set; }

    [DataType(DataType.Date)]
    public DateTime? DateOfBirth { get; set; }

    [StringLength(20)]
    public string? PassportNumber { get; set; }

    [StringLength(20)]
    public string? VisaNumber { get; set; }

    [DataType(DataType.Date)]
    public DateTime? VisaExpiry { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
    public virtual ICollection<SafetyEquipment> SafetyEquipment { get; set; } = new List<SafetyEquipment>();
    public virtual ICollection<Training> Trainings { get; set; } = new List<Training>();
    public virtual ICollection<CrewMember> CrewMemberships { get; set; } = new List<CrewMember>();
    public virtual ICollection<ProjectAssignment> ProjectAssignments { get; set; } = new List<ProjectAssignment>();
}

public class Document
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int PersonnelId { get; set; }

    [Required]
    [StringLength(100)]
    public string DocumentName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string DocumentType { get; set; } = string.Empty;

    [StringLength(255)]
    public string? FilePath { get; set; }

    [DataType(DataType.Date)]
    public DateTime? ExpiryDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "valid";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("PersonnelId")]
    public virtual Personnel Personnel { get; set; } = null!;
}

public class Project
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string ProjectName { get; set; } = string.Empty;

    [StringLength(20)]
    public string? ProjectCode { get; set; }

    [StringLength(255)]
    public string? Location { get; set; }

    [StringLength(100)]
    public string? Client { get; set; }

    [DataType(DataType.Date)]
    public DateTime? StartDate { get; set; }

    [DataType(DataType.Date)]
    public DateTime? EndDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "planning";

    [StringLength(1000)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<ProjectAssignment> Assignments { get; set; } = new List<ProjectAssignment>();
}

public class ProjectAssignment
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ProjectId { get; set; }

    [Required]
    public int PersonnelId { get; set; }

    [StringLength(100)]
    public string? Role { get; set; }

    [DataType(DataType.Date)]
    public DateTime? AssignedDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "assigned";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("ProjectId")]
    public virtual Project Project { get; set; } = null!;

    [ForeignKey("PersonnelId")]
    public virtual Personnel Personnel { get; set; } = null!;
}