using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookReading.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuoteRecords_User_UserId",
                table: "QuoteRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_ThoughtRecords_User_UserId",
                table: "ThoughtRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTags_User_UserId",
                table: "UserTags");

            migrationBuilder.DropPrimaryKey(
                name: "PK_User",
                table: "User");

            migrationBuilder.RenameTable(
                name: "User",
                newName: "Users");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Id");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "DeletedAt", "IsDeleted", "UpdatedAt", "UserName" },
                values: new object[] { 1, new DateTime(2026, 3, 20, 13, 8, 14, 197, DateTimeKind.Utc).AddTicks(508), null, false, new DateTime(2026, 3, 20, 13, 8, 14, 197, DateTimeKind.Utc).AddTicks(513), "TestUser" });

            migrationBuilder.AddForeignKey(
                name: "FK_QuoteRecords_Users_UserId",
                table: "QuoteRecords",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ThoughtRecords_Users_UserId",
                table: "ThoughtRecords",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserTags_Users_UserId",
                table: "UserTags",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuoteRecords_Users_UserId",
                table: "QuoteRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_ThoughtRecords_Users_UserId",
                table: "ThoughtRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTags_Users_UserId",
                table: "UserTags");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "User");

            migrationBuilder.AddPrimaryKey(
                name: "PK_User",
                table: "User",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_QuoteRecords_User_UserId",
                table: "QuoteRecords",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ThoughtRecords_User_UserId",
                table: "ThoughtRecords",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserTags_User_UserId",
                table: "UserTags",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
