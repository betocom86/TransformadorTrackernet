using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ProsecuAPI.Models;

namespace ProsecuAPI.Data;

public class ProsecuDbContext : IdentityDbContext<ApplicationUser>
{
    public ProsecuDbContext(DbContextOptions<ProsecuDbContext> options) : base(options)
    {
    }

    // Core entities
    public DbSet<Personnel> Personnel { get; set; }
    public DbSet<Document> Documents { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<ProjectAssignment> ProjectAssignments { get; set; }

    // Crew management
    public DbSet<Crew> Crews { get; set; }
    public DbSet<CrewMember> CrewMembers { get; set; }
    public DbSet<WorkOrder> WorkOrders { get; set; }
    public DbSet<WorkOrderPhoto> WorkOrderPhotos { get; set; }
    public DbSet<WorkOrderStep> WorkOrderSteps { get; set; }
    public DbSet<Route> Routes { get; set; }

    // Safety and training
    public DbSet<SafetyEquipment> SafetyEquipment { get; set; }
    public DbSet<Training> Trainings { get; set; }
    public DbSet<Alert> Alerts { get; set; }

    // Transformer management
    public DbSet<Transformer> Transformers { get; set; }
    public DbSet<WorkOrderTransformer> WorkOrderTransformers { get; set; }
    public DbSet<ProcedureCatalog> ProcedureCatalog { get; set; }
    public DbSet<TransformerProcedure> TransformerProcedures { get; set; }
    public DbSet<TransformerProcedurePhoto> TransformerProcedurePhotos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships and constraints
        ConfigurePersonnelRelationships(modelBuilder);
        ConfigureCrewRelationships(modelBuilder);
        ConfigureWorkOrderRelationships(modelBuilder);
        ConfigureTransformerRelationships(modelBuilder);
        ConfigureSafetyRelationships(modelBuilder);

        // Configure indexes for performance
        ConfigureIndexes(modelBuilder);

        // Seed initial data
        SeedData(modelBuilder);
    }

    private void ConfigurePersonnelRelationships(ModelBuilder modelBuilder)
    {
        // Personnel -> Documents (One-to-Many)
        modelBuilder.Entity<Document>()
            .HasOne(d => d.Personnel)
            .WithMany(p => p.Documents)
            .HasForeignKey(d => d.PersonnelId)
            .OnDelete(DeleteBehavior.Cascade);

        // Personnel -> ProjectAssignments (One-to-Many)
        modelBuilder.Entity<ProjectAssignment>()
            .HasOne(pa => pa.Personnel)
            .WithMany(p => p.ProjectAssignments)
            .HasForeignKey(pa => pa.PersonnelId)
            .OnDelete(DeleteBehavior.Cascade);

        // Project -> ProjectAssignments (One-to-Many)
        modelBuilder.Entity<ProjectAssignment>()
            .HasOne(pa => pa.Project)
            .WithMany(p => p.Assignments)
            .HasForeignKey(pa => pa.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void ConfigureCrewRelationships(ModelBuilder modelBuilder)
    {
        // Crew -> CrewMembers (One-to-Many)
        modelBuilder.Entity<CrewMember>()
            .HasOne(cm => cm.Crew)
            .WithMany(c => c.Members)
            .HasForeignKey(cm => cm.CrewId)
            .OnDelete(DeleteBehavior.Cascade);

        // Personnel -> CrewMembers (One-to-Many)
        modelBuilder.Entity<CrewMember>()
            .HasOne(cm => cm.Personnel)
            .WithMany(p => p.CrewMemberships)
            .HasForeignKey(cm => cm.PersonnelId)
            .OnDelete(DeleteBehavior.Restrict);

        // Crew -> Supervisor (Many-to-One, optional)
        modelBuilder.Entity<Crew>()
            .HasOne(c => c.Supervisor)
            .WithMany()
            .HasForeignKey(c => c.SupervisorId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private void ConfigureWorkOrderRelationships(ModelBuilder modelBuilder)
    {
        // WorkOrder -> AssignedCrew (Many-to-One, optional)
        modelBuilder.Entity<WorkOrder>()
            .HasOne(wo => wo.AssignedCrew)
            .WithMany(c => c.WorkOrders)
            .HasForeignKey(wo => wo.AssignedCrewId)
            .OnDelete(DeleteBehavior.SetNull);

        // WorkOrder -> RequestedBy (Many-to-One, optional)
        modelBuilder.Entity<WorkOrder>()
            .HasOne(wo => wo.RequestedBy)
            .WithMany()
            .HasForeignKey(wo => wo.RequestedById)
            .OnDelete(DeleteBehavior.SetNull);

        // WorkOrder -> Photos (One-to-Many)
        modelBuilder.Entity<WorkOrderPhoto>()
            .HasOne(wop => wop.WorkOrder)
            .WithMany(wo => wo.Photos)
            .HasForeignKey(wop => wop.WorkOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // WorkOrder -> Steps (One-to-Many)
        modelBuilder.Entity<WorkOrderStep>()
            .HasOne(wos => wos.WorkOrder)
            .WithMany(wo => wo.Steps)
            .HasForeignKey(wos => wos.WorkOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Route -> Crew (Many-to-One)
        modelBuilder.Entity<Route>()
            .HasOne(r => r.Crew)
            .WithMany(c => c.Routes)
            .HasForeignKey(r => r.CrewId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void ConfigureTransformerRelationships(ModelBuilder modelBuilder)
    {
        // WorkOrderTransformer -> WorkOrder (Many-to-One)
        modelBuilder.Entity<WorkOrderTransformer>()
            .HasOne(wot => wot.WorkOrder)
            .WithMany(wo => wo.Transformers)
            .HasForeignKey(wot => wot.WorkOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // WorkOrderTransformer -> Transformer (Many-to-One)
        modelBuilder.Entity<WorkOrderTransformer>()
            .HasOne(wot => wot.Transformer)
            .WithMany(t => t.WorkOrders)
            .HasForeignKey(wot => wot.TransformerId)
            .OnDelete(DeleteBehavior.Restrict);

        // TransformerProcedure relationships
        modelBuilder.Entity<TransformerProcedure>()
            .HasOne(tp => tp.Procedure)
            .WithMany(pc => pc.TransformerProcedures)
            .HasForeignKey(tp => tp.ProcedureId)
            .OnDelete(DeleteBehavior.Restrict);

        // TransformerProcedurePhoto -> TransformerProcedure (Many-to-One)
        modelBuilder.Entity<TransformerProcedurePhoto>()
            .HasOne(tpp => tpp.Procedure)
            .WithMany(tp => tp.Photos)
            .HasForeignKey(tpp => tpp.ProcedureId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void ConfigureSafetyRelationships(ModelBuilder modelBuilder)
    {
        // SafetyEquipment -> Personnel (Many-to-One)
        modelBuilder.Entity<SafetyEquipment>()
            .HasOne(se => se.Personnel)
            .WithMany(p => p.SafetyEquipment)
            .HasForeignKey(se => se.PersonnelId)
            .OnDelete(DeleteBehavior.Cascade);

        // Training -> Personnel (Many-to-One)
        modelBuilder.Entity<Training>()
            .HasOne(t => t.Personnel)
            .WithMany(p => p.Trainings)
            .HasForeignKey(t => t.PersonnelId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void ConfigureIndexes(ModelBuilder modelBuilder)
    {
        // Performance indexes
        modelBuilder.Entity<Personnel>()
            .HasIndex(p => p.EmployeeId)
            .IsUnique();

        modelBuilder.Entity<Personnel>()
            .HasIndex(p => p.Email);

        modelBuilder.Entity<WorkOrder>()
            .HasIndex(wo => wo.OrderNumber)
            .IsUnique();

        modelBuilder.Entity<WorkOrder>()
            .HasIndex(wo => wo.Status);

        modelBuilder.Entity<Document>()
            .HasIndex(d => d.ExpiryDate);

        modelBuilder.Entity<Training>()
            .HasIndex(t => t.ExpiryDate);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed initial procedure catalog
        modelBuilder.Entity<ProcedureCatalog>().HasData(
            new ProcedureCatalog
            {
                Id = 1,
                ProcedureName = "Inspección Visual de Transformador",
                Category = "Inspección",
                Description = "Inspección visual completa del transformador",
                Instructions = "1. Verificar estado físico externo\n2. Revisar conexiones\n3. Verificar nivel de aceite\n4. Documentar anomalías",
                SafetyRequirements = "Casco, guantes dieléctricos, zapatos de seguridad",
                ToolsRequired = "Linterna, multímetro, cámara",
                EstimatedTime = 30,
                Status = "active"
            },
            new ProcedureCatalog
            {
                Id = 2,
                ProcedureName = "Mantenimiento Preventivo",
                Category = "Mantenimiento",
                Description = "Mantenimiento preventivo programado",
                Instructions = "1. Desconectar alimentación\n2. Limpiar contactos\n3. Verificar torques\n4. Aplicar protectores",
                SafetyRequirements = "Bloqueo/etiquetado, EPP completo",
                ToolsRequired = "Torquímetro, limpiadores, herramientas básicas",
                EstimatedTime = 120,
                Status = "active"
            }
        );
    }
}