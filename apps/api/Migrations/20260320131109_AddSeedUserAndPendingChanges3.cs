using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookReading.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSeedUserAndPendingChanges3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 20, 13, 10, 25, 387, DateTimeKind.Utc).AddTicks(1580) });
        }
    }
}
